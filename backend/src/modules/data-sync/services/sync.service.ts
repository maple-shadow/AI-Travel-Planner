import { SyncChange, SyncConflict, SyncStatus, SyncResult, BatchSyncRequest, BatchSyncResult, ConflictResolution } from '../types/sync.types';
import { DefaultSyncStrategy, OptimisticSyncStrategy, SyncStrategy } from '../strategies/sync.strategy';
import { TimestampConflictStrategy, SmartConflictStrategy, ManualConflictStrategy, ConflictResolutionStrategy } from '../strategies/conflict.strategy';

export class SyncService {
    private syncStrategy: SyncStrategy;
    private conflictStrategy: ConflictResolutionStrategy;
    private userConfigs: Map<string, any> = new Map();

    constructor(strategy: 'default' | 'optimistic' = 'default', conflictStrategy: 'timestamp' | 'smart' | 'manual' = 'smart') {
        this.syncStrategy = strategy === 'optimistic'
            ? new OptimisticSyncStrategy()
            : new DefaultSyncStrategy();

        switch (conflictStrategy) {
            case 'timestamp':
                this.conflictStrategy = new TimestampConflictStrategy();
                break;
            case 'manual':
                this.conflictStrategy = new ManualConflictStrategy();
                break;
            default:
                this.conflictStrategy = new SmartConflictStrategy();
        }
    }

    // 同步变更
    async syncChanges(userId: string, changes: SyncChange[]): Promise<SyncResult> {
        try {
            // 验证用户权限
            await this.validateUserAccess(userId);

            // 应用变更
            const result = await this.syncStrategy.applyChanges(changes);

            // 自动解决可解决的冲突
            if (this.conflictStrategy instanceof SmartConflictStrategy) {
                await this.autoResolveConflicts(result.conflicts);
            }

            return {
                ...result,
                syncTime: new Date().toISOString()
            };
        } catch (error) {
            console.error('同步变更失败:', error);
            throw new Error(`同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 批量同步
    async batchSync(request: BatchSyncRequest): Promise<BatchSyncResult> {
        try {
            const { userId, deviceId, changes, lastSyncTime } = request;

            // 验证请求
            await this.validateBatchSyncRequest(request);

            // 同步变更
            const syncResult = await this.syncChanges(userId, changes);

            // 获取远程变更
            const remoteChanges = await this.syncStrategy.getChangesSince(lastSyncTime || null, userId);

            return {
                success: syncResult.failed.length === 0,
                applied: syncResult.applied.length,
                conflicts: syncResult.conflicts.length,
                errors: syncResult.failed.map(f => `变更 ${f.id} 同步失败`),
                syncTime: syncResult.syncTime
            };
        } catch (error) {
            console.error('批量同步失败:', error);
            return {
                success: false,
                applied: 0,
                conflicts: 0,
                errors: [error instanceof Error ? error.message : '未知错误'],
                syncTime: new Date().toISOString()
            };
        }
    }

    // 获取同步状态
    async getSyncStatus(userId: string): Promise<SyncStatus> {
        try {
            const userChanges = await this.syncStrategy.getChangesSince(null, userId);
            const conflicts = await this.syncStrategy.getUserConflicts(userId);

            // 获取设备数量（简化实现）
            const deviceCount = this.getUserDeviceCount(userId);

            return {
                userId,
                isSyncing: false, // 实际实现中需要跟踪同步状态
                lastSyncTime: this.getLastSyncTime(userId),
                pendingChanges: userChanges.length,
                conflicts: conflicts.length,
                deviceCount
            };
        } catch (error) {
            console.error('获取同步状态失败:', error);
            throw new Error(`获取同步状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 解决冲突
    async resolveConflict(userId: string, conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
        try {
            // 验证用户权限
            await this.validateUserAccess(userId);

            // 解决冲突
            await this.syncStrategy.resolveConflict(conflictId, resolution);

            // 记录解决日志
            await this.logConflictResolution(userId, conflictId, resolution);

        } catch (error) {
            console.error('解决冲突失败:', error);
            throw new Error(`解决冲突失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 获取冲突列表
    async getConflicts(userId: string): Promise<SyncConflict[]> {
        try {
            await this.validateUserAccess(userId);
            return await this.syncStrategy.getUserConflicts(userId);
        } catch (error) {
            console.error('获取冲突列表失败:', error);
            throw new Error(`获取冲突列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 清理已解决的冲突
    async cleanupResolvedConflicts(userId: string): Promise<void> {
        try {
            await this.validateUserAccess(userId);
            await this.syncStrategy.cleanupResolvedConflicts();
        } catch (error) {
            console.error('清理冲突失败:', error);
            throw new Error(`清理冲突失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 自动解决冲突
    private async autoResolveConflicts(conflicts: SyncConflict[]): Promise<void> {
        for (const conflict of conflicts) {
            try {
                const resolution = await this.conflictStrategy.resolve(conflict);

                if (resolution.resolution !== 'merge' || resolution.resolvedChange) {
                    await this.syncStrategy.resolveConflict(conflict.id, resolution.resolution);
                }
            } catch (error) {
                console.error(`自动解决冲突失败: ${conflict.id}`, error);
                // 记录自动解决失败的冲突，以便后续手动处理
                await this.logConflictResolution('system', conflict.id, `auto_resolve_failed: ${error instanceof Error ? error.message : '未知错误'}`);
            }
        }
    }

    // 验证用户访问权限
    private async validateUserAccess(userId: string): Promise<void> {
        // 实际实现中应该验证用户是否存在和权限
        if (!userId) {
            throw new Error('用户ID不能为空');
        }
        // 这里可以添加更复杂的权限验证逻辑
    }

    // 验证批量同步请求
    private async validateBatchSyncRequest(request: BatchSyncRequest): Promise<void> {
        const { userId, deviceId, changes } = request;

        if (!userId || !deviceId) {
            throw new Error('用户ID和设备ID不能为空');
        }

        if (!Array.isArray(changes)) {
            throw new Error('变更数据格式错误');
        }

        // 验证每个变更的格式
        for (const change of changes) {
            if (!change.id || !change.type || !change.entity || !change.entityId) {
                throw new Error(`变更数据格式错误: ${JSON.stringify(change)}`);
            }
        }
    }

    // 获取用户设备数量（简化实现）
    private getUserDeviceCount(userId: string): number {
        // 实际实现中应该从数据库查询
        return 1; // 简化返回
    }

    // 获取最后同步时间
    private getLastSyncTime(userId: string): string | null {
        // 实际实现中应该从数据库查询
        return null; // 简化返回
    }

    // 记录冲突解决日志
    private async logConflictResolution(userId: string, conflictId: string, resolution: string): Promise<void> {
        // 实际实现中应该记录到数据库
        console.log(`用户 ${userId} 解决了冲突 ${conflictId}，方案: ${resolution}`);
    }

    // 更新用户配置
    async updateUserConfig(userId: string, config: any): Promise<void> {
        this.userConfigs.set(userId, { ...this.userConfigs.get(userId), ...config });
    }

    // 获取用户配置
    async getUserConfig(userId: string): Promise<any> {
        return this.userConfigs.get(userId) || {
            autoSync: true,
            syncInterval: 30000,
            maxRetries: 3,
            conflictStrategy: 'smart'
        };
    }
}

// 创建单例实例
export const syncService = new SyncService();