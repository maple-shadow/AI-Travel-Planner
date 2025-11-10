import { SyncChange, SyncConflict } from '../types/sync.types';

export class SyncUtils {
    // 生成唯一的变更ID
    static generateChangeId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 获取设备ID
    static getDeviceId(): string {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    // 比较变更版本
    static compareChanges(local: SyncChange, remote: SyncChange): number {
        if (local.timestamp > remote.timestamp) return 1;
        if (local.timestamp < remote.timestamp) return -1;
        return 0;
    }

    // 检测冲突
    static detectConflict(local: SyncChange, remote: SyncChange): boolean {
        return (
            local.entity === remote.entity &&
            local.entityId === remote.entityId &&
            local.type === 'update' &&
            remote.type === 'update' &&
            local.timestamp !== remote.timestamp
        );
    }

    // 合并变更
    static mergeChanges(changes: SyncChange[]): SyncChange[] {
        const merged = new Map<string, SyncChange>();

        changes.forEach(change => {
            const key = `${change.entity}-${change.entityId}`;
            const existing = merged.get(key);

            if (!existing || this.compareChanges(change, existing) > 0) {
                merged.set(key, change);
            }
        });

        return Array.from(merged.values());
    }

    // 验证变更数据
    static validateChange(change: SyncChange): boolean {
        return (
            !!change.id &&
            !!change.type &&
            !!change.entity &&
            !!change.entityId &&
            !!change.timestamp &&
            !!change.deviceId
        );
    }

    // 格式化时间戳
    static formatTimestamp(date: Date = new Date()): string {
        return date.toISOString();
    }

    // 计算变更哈希（用于冲突检测）
    static calculateChangeHash(change: SyncChange): string {
        const data = JSON.stringify({
            type: change.type,
            entity: change.entity,
            entityId: change.entityId,
            data: change.data,
            timestamp: change.timestamp
        });

        // 简单的哈希函数
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
}