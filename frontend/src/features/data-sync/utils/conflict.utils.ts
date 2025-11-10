import { SyncChange, SyncConflict } from '../types/sync.types';

export class ConflictUtils {
    // 自动解决冲突（基于时间戳）
    static autoResolveConflict(local: SyncChange, remote: SyncChange): 'local' | 'remote' {
        return local.timestamp > remote.timestamp ? 'local' : 'remote';
    }

    // 合并数据（用于手动解决冲突）
    static mergeData(localData: any, remoteData: any): any {
        if (typeof localData !== 'object' || typeof remoteData !== 'object') {
            return localData; // 非对象类型，返回本地数据
        }

        const merged = { ...localData };

        // 深度合并对象
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

    // 检测数据变更类型
    static getChangeType(local: any, remote: any): 'create' | 'update' | 'delete' {
        if (!local && remote) return 'create';
        if (local && !remote) return 'delete';
        return 'update';
    }

    // 生成冲突描述
    static generateConflictDescription(conflict: SyncConflict): string {
        const { localChange, remoteChange } = conflict;
        const localTime = new Date(localChange.timestamp).toLocaleString();
        const remoteTime = new Date(remoteChange.timestamp).toLocaleString();

        return `${conflict.entity} ${conflict.entityId} 在本地修改于 ${localTime}，在远程修改于 ${remoteTime}`;
    }

    // 验证冲突解决方案
    static validateResolution(conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge'): boolean {
        if (resolution === 'merge') {
            return conflict.localChange.type === 'update' && conflict.remoteChange.type === 'update';
        }
        return true;
    }

    // 应用冲突解决方案
    static applyResolution(conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge'): SyncChange {
        switch (resolution) {
            case 'local':
                return conflict.localChange;
            case 'remote':
                return conflict.remoteChange;
            case 'merge':
                const mergedData = this.mergeData(
                    conflict.localChange.data,
                    conflict.remoteChange.data
                );
                return {
                    ...conflict.localChange,
                    data: mergedData,
                    timestamp: new Date().toISOString()
                };
            default:
                return conflict.localChange;
        }
    }

    // 计算冲突优先级
    static calculateConflictPriority(conflict: SyncConflict): number {
        let priority = 0;

        // 基于实体类型设置优先级
        switch (conflict.entity) {
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

        // 基于时间差设置优先级（时间差越大，优先级越低）
        const timeDiff = Math.abs(
            new Date(conflict.localChange.timestamp).getTime() -
            new Date(conflict.remoteChange.timestamp).getTime()
        );
        priority -= Math.min(timeDiff / (1000 * 60 * 60), 50); // 每小时减少1点，最多减少50点

        return Math.max(priority, 1);
    }
}