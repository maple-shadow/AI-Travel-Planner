import { SyncChange, SyncConflict } from '../types/sync.types';

export abstract class SyncStrategy {
    abstract applyChanges(changes: SyncChange[]): Promise<{
        applied: SyncChange[];
        conflicts: SyncConflict[];
        failed: SyncChange[];
    }>;

    abstract getChangesSince(timestamp: string | null, userId: string): Promise<SyncChange[]>;

    abstract getUserConflicts(userId: string): Promise<SyncConflict[]>;

    abstract resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void>;

    abstract cleanupResolvedConflicts(): Promise<void>;

    protected validateChange(change: SyncChange): boolean {
        return (
            !!change.id &&
            !!change.type &&
            !!change.entity &&
            !!change.entityId &&
            !!change.timestamp &&
            !!change.deviceId &&
            !!change.userId
        );
    }

    protected detectConflict(local: SyncChange, remote: SyncChange): boolean {
        return (
            local.entity === remote.entity &&
            local.entityId === remote.entityId &&
            local.type === 'update' &&
            remote.type === 'update' &&
            local.timestamp !== remote.timestamp &&
            local.deviceId !== remote.deviceId
        );
    }

    protected compareTimestamps(a: string, b: string): number {
        return new Date(a).getTime() - new Date(b).getTime();
    }
}

export class DefaultSyncStrategy extends SyncStrategy {
    private changeLog: Map<string, SyncChange[]> = new Map();
    private conflicts: Map<string, SyncConflict> = new Map();

    override async applyChanges(changes: SyncChange[]): Promise<{
        applied: SyncChange[];
        conflicts: SyncConflict[];
        failed: SyncChange[];
    }> {
        const applied: SyncChange[] = [];
        const conflicts: SyncConflict[] = [];
        const failed: SyncChange[] = [];

        for (const change of changes) {
            if (!this.validateChange(change)) {
                failed.push(change);
                continue;
            }

            try {
                // 检查是否存在冲突
                const existingChanges = this.changeLog.get(change.userId) || [];
                const conflictingChange = existingChanges.find(existing =>
                    this.detectConflict(existing, change)
                );

                if (conflictingChange) {
                    // 创建冲突记录
                    const conflict: SyncConflict = {
                        id: `${change.id}-${conflictingChange.id}`,
                        localChange: conflictingChange,
                        remoteChange: change,
                        entity: change.entity,
                        entityId: change.entityId,
                        userId: change.userId,
                        resolved: false
                    };

                    this.conflicts.set(conflict.id, conflict);
                    conflicts.push(conflict);
                } else {
                    // 应用变更
                    applied.push(change);
                    this.changeLog.set(change.userId, [
                        ...existingChanges.filter(c =>
                            !(c.entity === change.entity && c.entityId === change.entityId)
                        ),
                        change
                    ]);
                }
            } catch (error) {
                console.error(`应用变更失败: ${change.id}`, error);
                failed.push(change);
            }
        }

        return { applied, conflicts, failed };
    }

    async getChangesSince(timestamp: string | null, userId: string): Promise<SyncChange[]> {
        const userChanges = this.changeLog.get(userId) || [];

        if (!timestamp) {
            return userChanges;
        }

        return userChanges.filter(change =>
            new Date(change.timestamp) > new Date(timestamp)
        );
    }

    // 获取用户的冲突列表
    async getUserConflicts(userId: string): Promise<SyncConflict[]> {
        return Array.from(this.conflicts.values())
            .filter(conflict => conflict.userId === userId && !conflict.resolved);
    }

    // 解决冲突
    async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) {
            throw new Error(`冲突不存在: ${conflictId}`);
        }

        conflict.resolved = true;
        conflict.resolution = resolution;
        conflict.resolvedAt = new Date().toISOString();
        conflict.resolvedBy = 'system';

        // 根据解决方案更新变更日志
        if (resolution === 'remote') {
            const userChanges = this.changeLog.get(conflict.userId) || [];
            this.changeLog.set(conflict.userId, [
                ...userChanges.filter(c =>
                    !(c.entity === conflict.entity && c.entityId === conflict.entityId)
                ),
                conflict.remoteChange
            ]);
        }
        // 对于local和merge，变更日志已经包含最新版本
    }

    // 清理已解决的冲突
    async cleanupResolvedConflicts(): Promise<void> {
        for (const [id, conflict] of this.conflicts.entries()) {
            if (conflict.resolved) {
                this.conflicts.delete(id);
            }
        }
    }
}

export class OptimisticSyncStrategy extends DefaultSyncStrategy {
    override async applyChanges(changes: SyncChange[]): Promise<{
        applied: SyncChange[];
        conflicts: SyncConflict[];
        failed: SyncChange[];
    }> {
        // 乐观同步策略：先应用所有变更，然后检测冲突
        const result = await super.applyChanges(changes);

        // 对于乐观策略，我们可以尝试自动解决一些简单的冲突
        const autoResolvableConflicts = result.conflicts.filter(conflict => {
            // 自动解决时间戳差异较小的冲突
            const timeDiff = Math.abs(
                new Date(conflict.localChange.timestamp).getTime() -
                new Date(conflict.remoteChange.timestamp).getTime()
            );
            return timeDiff < 60000; // 1分钟内的冲突
        });

        for (const conflict of autoResolvableConflicts) {
            const resolution = conflict.localChange.timestamp > conflict.remoteChange.timestamp
                ? 'local'
                : 'remote';

            await this.resolveConflict(conflict.id, resolution);
        }

        // 从结果中移除已自动解决的冲突
        result.conflicts = result.conflicts.filter(conflict =>
            !autoResolvableConflicts.includes(conflict)
        );

        return result;
    }
}