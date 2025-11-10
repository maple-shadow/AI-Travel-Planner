import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncStatus, SyncChange, SyncConflict, SyncConfig } from '../types/sync.types';
import { SyncUtils } from '../utils/sync.utils';
import { ConflictUtils } from '../utils/conflict.utils';
import syncService from '../services/syncService';
import { useOfflineStorage } from './useOfflineStorage';

const DEFAULT_CONFIG: SyncConfig = {
    autoSync: true,
    syncInterval: 30000, // 30秒
    maxRetries: 3,
    conflictStrategy: 'manual',
};

export const useDataSync = (config: Partial<SyncConfig> = {}) => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        lastSyncTime: null,
        pendingChanges: 0,
        conflicts: 0,
        networkStatus: navigator.onLine ? 'online' : 'offline',
    });

    const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
    const [error, setError] = useState<string | null>(null);

    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef<number>(0);

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const {
        offlineData,
        queueChange,
        getPendingChanges,
        clearSyncedChanges,
        validateOfflineData,
        getStorageStats
    } = useOfflineStorage();

    // 更新同步状态
    const updateSyncStatus = useCallback((updates: Partial<SyncStatus>) => {
        setSyncStatus(prev => ({ ...prev, ...updates }));
    }, []);

    // 检测网络状态变化
    useEffect(() => {
        const handleOnline = () => {
            updateSyncStatus({ networkStatus: 'online' });
            if (mergedConfig.autoSync) {
                startSync();
            }
        };

        const handleOffline = () => {
            updateSyncStatus({ networkStatus: 'offline' });
            stopSync();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [mergedConfig.autoSync]);

    // 初始化同步
    const initializeSync = useCallback(async () => {
        try {
            updateSyncStatus({ isSyncing: true });

            // 验证离线数据
            const validation = validateOfflineData();
            if (!validation.isValid) {
                console.warn('离线数据验证失败:', validation.errors);
            }

            // 检查网络连接
            const isOnline = await syncService.checkNetwork();
            updateSyncStatus({
                networkStatus: isOnline ? 'online' : 'offline'
            });

            if (isOnline && mergedConfig.autoSync) {
                await startSync();
            }

            // 加载冲突列表
            const conflictList = await syncService.getConflicts();
            setConflicts(conflictList);
            updateSyncStatus({ conflicts: conflictList.length });

        } catch (error) {
            console.error('初始化同步失败:', error);
            setError('初始化同步失败');
        } finally {
            updateSyncStatus({ isSyncing: false });
        }
    }, [mergedConfig.autoSync]);

    // 开始同步
    const startSync = useCallback(async (): Promise<boolean> => {
        if (syncStatus.isSyncing) {
            console.log('同步正在进行中');
            return false;
        }

        try {
            updateSyncStatus({ isSyncing: true, error: undefined });

            const pendingChanges = getPendingChanges();
            updateSyncStatus({ pendingChanges: pendingChanges.length });

            if (pendingChanges.length === 0) {
                console.log('没有待同步的变更');
                return true;
            }

            // 同步变更到服务器
            const result = await syncService.syncChanges(pendingChanges);

            // 处理同步结果
            if (result.applied.length > 0) {
                clearSyncedChanges(result.applied.map(change => change.id));
            }

            // 更新冲突列表
            if (result.conflicts.length > 0) {
                setConflicts(prev => [...prev, ...result.conflicts]);
                updateSyncStatus({ conflicts: result.conflicts.length });
            }

            // 获取远程变更
            const remoteChanges = await syncService.getRemoteChanges(syncStatus.lastSyncTime);
            if (remoteChanges.length > 0) {
                await applyRemoteChanges(remoteChanges);
            }

            updateSyncStatus({
                lastSyncTime: SyncUtils.formatTimestamp(),
                pendingChanges: getPendingChanges().length,
            });

            retryCountRef.current = 0;
            return true;

        } catch (error) {
            console.error('同步失败:', error);
            setError('同步失败，请检查网络连接');

            // 重试逻辑
            if (retryCountRef.current < mergedConfig.maxRetries) {
                retryCountRef.current++;
                console.log(`第 ${retryCountRef.current} 次重试...`);
                setTimeout(() => startSync(), 5000); // 5秒后重试
            }

            return false;
        } finally {
            updateSyncStatus({ isSyncing: false });
        }
    }, [syncStatus, mergedConfig.maxRetries]);

    // 应用远程变更
    const applyRemoteChanges = useCallback(async (remoteChanges: SyncChange[]) => {
        // 这里应该调用相应的服务来应用远程变更到本地存储
        // 例如：tripService.applyRemoteChanges(remoteChanges)
        console.log('应用远程变更:', remoteChanges);

        // 模拟应用变更
        remoteChanges.forEach(change => {
            console.log(`应用变更: ${change.entity} ${change.entityId}`);
        });
    }, []);

    // 暂停同步
    const pauseSync = useCallback(() => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
        }
        updateSyncStatus({ isSyncing: false });
    }, []);

    // 恢复同步
    const resumeSync = useCallback(() => {
        if (!syncIntervalRef.current && mergedConfig.autoSync) {
            startAutoSync();
        }
    }, [mergedConfig.autoSync]);

    // 停止同步
    const stopSync = useCallback(() => {
        pauseSync();
        retryCountRef.current = 0;
    }, [pauseSync]);

    // 开始自动同步
    const startAutoSync = useCallback(() => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
        }

        syncIntervalRef.current = setInterval(async () => {
            if (syncStatus.networkStatus === 'online' && !syncStatus.isSyncing) {
                await startSync();
            }
        }, mergedConfig.syncInterval);
    }, [syncStatus, mergedConfig.syncInterval]);

    // 解决冲突
    const resolveConflict = useCallback(async (
        conflictId: string,
        resolution: 'local' | 'remote' | 'merge'
    ) => {
        try {
            await syncService.resolveConflict(conflictId, resolution);

            // 从冲突列表中移除已解决的冲突
            setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
            updateSyncStatus({ conflicts: conflicts.length - 1 });

        } catch (error) {
            console.error('解决冲突失败:', error);
            setError('解决冲突失败');
        }
    }, [conflicts.length]);

    // 自动解决所有冲突
    const autoResolveAllConflicts = useCallback(async () => {
        try {
            for (const conflict of conflicts) {
                const resolution = ConflictUtils.autoResolveConflict(
                    conflict.localChange,
                    conflict.remoteChange
                );
                await resolveConflict(conflict.id, resolution);
            }
        } catch (error) {
            console.error('自动解决冲突失败:', error);
            setError('自动解决冲突失败');
        }
    }, [conflicts, resolveConflict]);

    // 队列变更
    const queueDataChange = useCallback((change: Omit<SyncChange, 'id' | 'deviceId' | 'timestamp'>) => {
        const changeId = queueChange(change);

        // 如果在线且自动同步，立即开始同步
        if (syncStatus.networkStatus === 'online' && mergedConfig.autoSync) {
            startSync();
        }

        return changeId;
    }, [syncStatus.networkStatus, mergedConfig.autoSync]);

    // 清理同步数据
    const cleanupSyncData = useCallback(async () => {
        try {
            await syncService.cleanupResolvedConflicts();
            setConflicts([]);
            updateSyncStatus({ conflicts: 0 });
        } catch (error) {
            console.error('清理同步数据失败:', error);
        }
    }, []);

    // 初始化自动同步
    useEffect(() => {
        if (mergedConfig.autoSync && syncStatus.networkStatus === 'online') {
            startAutoSync();
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [mergedConfig.autoSync, syncStatus.networkStatus]);

    // 初始化时加载数据
    useEffect(() => {
        initializeSync();
    }, []);

    // 更新待同步变更数量
    useEffect(() => {
        const pendingChanges = getPendingChanges();
        updateSyncStatus({ pendingChanges: pendingChanges.length });
    }, [offlineData]);

    return {
        // 状态
        syncStatus,
        conflicts,
        error,

        // 配置
        config: mergedConfig,

        // 操作方法
        initializeSync,
        startSync,
        pauseSync,
        resumeSync,
        stopSync,
        queueDataChange,
        resolveConflict,
        autoResolveAllConflicts,
        cleanupSyncData,

        // 工具方法
        getPendingChanges,
        getStorageStats,
    };
};