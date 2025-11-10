import { useState, useEffect, useCallback } from 'react';
import { OfflineData, SyncChange } from '../types/sync.types';
import { SyncUtils } from '../utils/sync.utils';

const OFFLINE_STORAGE_KEY = 'ai-travel-planner-offline-data';

export const useOfflineStorage = () => {
    const [offlineData, setOfflineData] = useState<OfflineData | null>(null);

    // 加载离线数据
    const loadOfflineData = useCallback((): OfflineData | null => {
        try {
            const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // 验证数据格式
                if (data && data.changes && Array.isArray(data.changes)) {
                    return data;
                }
            }
        } catch (error) {
            console.error('加载离线数据失败:', error);
        }
        return null;
    }, []);

    // 保存离线数据
    const saveOfflineData = useCallback((data: OfflineData) => {
        try {
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
            setOfflineData(data);
        } catch (error) {
            console.error('保存离线数据失败:', error);
        }
    }, []);

    // 添加变更到离线存储
    const queueChange = useCallback((change: Omit<SyncChange, 'id' | 'deviceId' | 'timestamp'>) => {
        const newChange: SyncChange = {
            ...change,
            id: SyncUtils.generateChangeId(),
            deviceId: SyncUtils.getDeviceId(),
            timestamp: SyncUtils.formatTimestamp(),
        };

        const currentData = loadOfflineData() || {
            changes: [],
            lastSyncTime: null,
            deviceId: SyncUtils.getDeviceId(),
            version: '1.0.0',
        };

        const updatedData: OfflineData = {
            ...currentData,
            changes: [...currentData.changes, newChange],
        };

        saveOfflineData(updatedData);
        return newChange.id;
    }, [loadOfflineData, saveOfflineData]);

    // 获取待同步的变更
    const getPendingChanges = useCallback((): SyncChange[] => {
        const data = loadOfflineData();
        return data?.changes || [];
    }, [loadOfflineData]);

    // 清除已同步的变更
    const clearSyncedChanges = useCallback((syncedChangeIds: string[]) => {
        const data = loadOfflineData();
        if (!data) return;

        const updatedData: OfflineData = {
            ...data,
            changes: data.changes.filter(change => !syncedChangeIds.includes(change.id)),
            lastSyncTime: SyncUtils.formatTimestamp(),
        };

        saveOfflineData(updatedData);
    }, [loadOfflineData, saveOfflineData]);

    // 清除所有离线数据
    const clearOfflineStorage = useCallback(() => {
        try {
            localStorage.removeItem(OFFLINE_STORAGE_KEY);
            setOfflineData(null);
        } catch (error) {
            console.error('清除离线存储失败:', error);
        }
    }, []);

    // 验证离线数据完整性
    const validateOfflineData = useCallback((): { isValid: boolean; errors: string[] } => {
        const data = loadOfflineData();
        const errors: string[] = [];

        if (!data) {
            return { isValid: true, errors: [] }; // 没有数据也是有效的
        }

        if (!data.deviceId) {
            errors.push('缺少设备ID');
        }

        if (!data.version) {
            errors.push('缺少版本信息');
        }

        if (!Array.isArray(data.changes)) {
            errors.push('变更数据格式错误');
        } else {
            data.changes.forEach((change, index) => {
                if (!SyncUtils.validateChange(change)) {
                    errors.push(`变更 ${index} 格式错误`);
                }
            });
        }

        return { isValid: errors.length === 0, errors };
    }, [loadOfflineData]);

    // 获取离线存储统计信息
    const getStorageStats = useCallback(() => {
        const data = loadOfflineData();
        if (!data) {
            return {
                changeCount: 0,
                lastSyncTime: null,
                storageSize: 0,
            };
        }

        const storageSize = new Blob([JSON.stringify(data)]).size;

        return {
            changeCount: data.changes.length,
            lastSyncTime: data.lastSyncTime,
            storageSize,
        };
    }, [loadOfflineData]);

    // 初始化时加载离线数据
    useEffect(() => {
        const data = loadOfflineData();
        setOfflineData(data);
    }, [loadOfflineData]);

    return {
        offlineData,
        queueChange,
        getPendingChanges,
        clearSyncedChanges,
        clearOfflineStorage,
        validateOfflineData,
        getStorageStats,
        saveOfflineData,
        loadOfflineData,
    };
};