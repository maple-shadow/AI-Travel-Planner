import { SyncConflict, SyncChange } from '../types/sync.types';

export abstract class ConflictResolutionStrategy {
    abstract resolve(conflict: SyncConflict): Promise<{
        resolution: 'local' | 'remote' | 'merge';
        resolvedChange?: SyncChange;
        reason: string;
    }>;

    protected canMerge(local: SyncChange, remote: SyncChange): boolean {
        return (
            local.type === 'update' &&
            remote.type === 'update' &&
            this.isMergeableEntity(local.entity)
        );
    }

    protected isMergeableEntity(entity: string): boolean {
        const mergeableEntities = ['trip', 'budget', 'expense', 'user'];
        return mergeableEntities.includes(entity);
    }

    protected mergeData(localData: any, remoteData: any): any {
        if (typeof localData !== 'object' || typeof remoteData !== 'object') {
            return localData;
        }

        const merged = { ...localData };

        Object.keys(remoteData).forEach(key => {
            if (remoteData[key] !== undefined) {
                if (typeof remoteData[key] === 'object' && remoteData[key] !== null) {
                    merged[key] = this.mergeData(localData[key] || {}, remoteData[key]);
                } else {
                    merged[key] = remoteData[key];
                }
            }
        });

        return merged;
    }

    protected calculatePriority(change: SyncChange): number {
        let priority = 0;

        // 基于实体类型设置优先级
        switch (change.entity) {
            case 'trip':
                priority += 100;
                break;
            case 'budget':
                priority += 80;
                break;
            case 'expense':
                priority += 60;
                break;
            case 'user':
                priority += 40;
                break;
            default:
                priority += 20;
        }

        // 基于变更类型设置优先级
        switch (change.type) {
            case 'create':
                priority += 30;
                break;
            case 'update':
                priority += 20;
                break;
            case 'delete':
                priority += 10;
                break;
        }

        return priority;
    }
}

export class TimestampConflictStrategy extends ConflictResolutionStrategy {
    async resolve(conflict: SyncConflict): Promise<{
        resolution: 'local' | 'remote' | 'merge';
        resolvedChange?: SyncChange;
        reason: string;
    }> {
        const { localChange, remoteChange } = conflict;

        // 基于时间戳解决冲突
        if (localChange.timestamp > remoteChange.timestamp) {
            return {
                resolution: 'local',
                reason: '本地变更时间较新'
            };
        } else if (remoteChange.timestamp > localChange.timestamp) {
            return {
                resolution: 'remote',
                reason: '远程变更时间较新'
            };
        } else {
            // 时间戳相同，基于优先级
            const localPriority = this.calculatePriority(localChange);
            const remotePriority = this.calculatePriority(remoteChange);

            if (localPriority > remotePriority) {
                return {
                    resolution: 'local',
                    reason: '本地变更优先级较高'
                };
            } else if (remotePriority > localPriority) {
                return {
                    resolution: 'remote',
                    reason: '远程变更优先级较高'
                };
            } else {
                // 优先级相同，尝试合并
                if (this.canMerge(localChange, remoteChange)) {
                    const mergedData = this.mergeData(localChange.data, remoteChange.data);
                    const resolvedChange: SyncChange = {
                        ...localChange,
                        data: mergedData,
                        timestamp: new Date().toISOString()
                    };

                    return {
                        resolution: 'merge',
                        resolvedChange,
                        reason: '成功合并两个版本'
                    };
                } else {
                    // 无法合并，默认使用本地版本
                    return {
                        resolution: 'local',
                        reason: '无法合并，使用本地版本'
                    };
                }
            }
        }
    }
}

export class SmartConflictStrategy extends ConflictResolutionStrategy {
    async resolve(conflict: SyncConflict): Promise<{
        resolution: 'local' | 'remote' | 'merge';
        resolvedChange?: SyncChange;
        reason: string;
    }> {
        const { localChange, remoteChange } = conflict;

        // 智能冲突解决策略

        // 1. 检查是否为删除操作
        if (localChange.type === 'delete' || remoteChange.type === 'delete') {
            return this.resolveDeleteConflict(conflict);
        }

        // 2. 检查时间戳差异
        const timeDiff = Math.abs(
            new Date(localChange.timestamp).getTime() -
            new Date(remoteChange.timestamp).getTime()
        );

        // 如果时间戳差异很小（5分钟内），尝试合并
        if (timeDiff < 300000 && this.canMerge(localChange, remoteChange)) {
            const mergedData = this.mergeData(localChange.data, remoteChange.data);
            const resolvedChange: SyncChange = {
                ...localChange,
                data: mergedData,
                timestamp: new Date().toISOString()
            };

            return {
                resolution: 'merge',
                resolvedChange,
                reason: '时间戳相近，成功合并'
            };
        }

        // 3. 基于变更内容分析
        const contentAnalysis = this.analyzeContent(conflict);
        if (contentAnalysis.preferredResolution) {
            return {
                resolution: contentAnalysis.preferredResolution,
                reason: contentAnalysis.reason
            };
        }

        // 4. 默认使用时间戳策略
        const timestampStrategy = new TimestampConflictStrategy();
        return timestampStrategy.resolve(conflict);
    }

    private resolveDeleteConflict(conflict: SyncConflict): {
        resolution: 'local' | 'remote' | 'merge';
        reason: string;
    } {
        const { localChange, remoteChange } = conflict;

        if (localChange.type === 'delete' && remoteChange.type === 'delete') {
            return {
                resolution: 'local',
                reason: '双方都删除，使用本地操作'
            };
        } else if (localChange.type === 'delete') {
            return {
                resolution: 'local',
                reason: '本地已删除，优先删除操作'
            };
        } else if (remoteChange.type === 'delete') {
            return {
                resolution: 'remote',
                reason: '远程已删除，优先删除操作'
            };
        }

        return {
            resolution: 'local',
            reason: '默认使用本地版本'
        };
    }

    private analyzeContent(conflict: SyncConflict): {
        preferredResolution?: 'local' | 'remote' | 'merge';
        reason: string;
    } {
        const { localChange, remoteChange } = conflict;

        // 分析变更内容，这里可以实现更复杂的业务逻辑
        // 例如：检查哪个变更包含更多信息、哪个变更更完整等

        const localDataSize = JSON.stringify(localChange.data).length;
        const remoteDataSize = JSON.stringify(remoteChange.data).length;

        if (localDataSize > remoteDataSize * 1.5) {
            return {
                preferredResolution: 'local',
                reason: '本地变更包含更多信息'
            };
        } else if (remoteDataSize > localDataSize * 1.5) {
            return {
                preferredResolution: 'remote',
                reason: '远程变更包含更多信息'
            };
        }

        return {
            preferredResolution: undefined as 'local' | 'remote' | 'merge' | undefined,
            reason: '内容分析无明确倾向'
        } as {
            preferredResolution?: 'local' | 'remote' | 'merge';
            reason: string;
        };
    }
}

export class ManualConflictStrategy extends ConflictResolutionStrategy {
    async resolve(conflict: SyncConflict): Promise<{
        resolution: 'local' | 'remote' | 'merge';
        resolvedChange?: SyncChange;
        reason: string;
    }> {
        // 手动解决策略，总是返回需要手动解决的标记
        // 实际应用中，这个策略会等待用户输入

        return {
            resolution: 'local', // 临时返回值
            reason: '需要手动解决冲突'
        };
    }

    // 手动设置解决方案
    setManualResolution(
        conflict: SyncConflict,
        resolution: 'local' | 'remote' | 'merge'
    ): {
        resolution: 'local' | 'remote' | 'merge';
        resolvedChange?: SyncChange;
        reason: string;
    } {
        let resolvedChange: SyncChange | undefined;

        if (resolution === 'merge' && this.canMerge(conflict.localChange, conflict.remoteChange)) {
            const mergedData = this.mergeData(conflict.localChange.data, conflict.remoteChange.data);
            resolvedChange = {
                ...conflict.localChange,
                data: mergedData,
                timestamp: new Date().toISOString()
            };
        }

        return {
            resolution,
            resolvedChange,
            reason: `手动选择: ${resolution}`
        } as {
            resolution: 'local' | 'remote' | 'merge';
            resolvedChange?: SyncChange;
            reason: string;
        };
    }
}