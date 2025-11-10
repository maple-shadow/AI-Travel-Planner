import React from 'react';
import { SyncStatus as SyncStatusType } from '../types/sync.types';
import './SyncStatus.css';

interface SyncStatusProps {
    status: SyncStatusType;
    onSyncClick?: () => void;
    onResolveConflicts?: () => void;
    className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
    status,
    onSyncClick,
    onResolveConflicts,
    className = ''
}) => {
    const getStatusIcon = () => {
        if (status.isSyncing) return '🔄';
        if (status.networkStatus === 'offline') return '📴';
        if (status.conflicts > 0) return '⚠️';
        if (status.pendingChanges > 0) return '⏳';
        return '✅';
    };

    const getStatusText = () => {
        if (status.isSyncing) return '同步中...';
        if (status.networkStatus === 'offline') return '离线模式';
        if (status.conflicts > 0) return `${status.conflicts} 个冲突待解决`;
        if (status.pendingChanges > 0) return `${status.pendingChanges} 个变更待同步`;
        return '已同步';
    };

    const getStatusClass = () => {
        if (status.isSyncing) return 'sync-status--syncing';
        if (status.networkStatus === 'offline') return 'sync-status--offline';
        if (status.conflicts > 0) return 'sync-status--conflict';
        if (status.pendingChanges > 0) return 'sync-status--pending';
        return 'sync-status--synced';
    };

    const formatLastSyncTime = () => {
        if (!status.lastSyncTime) return '从未同步';

        const lastSync = new Date(status.lastSyncTime);
        const now = new Date();
        const diffMs = now.getTime() - lastSync.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins} 分钟前`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小时前`;
        return `${Math.floor(diffMins / 1440)} 天前`;
    };

    return (
        <div className={`sync-status ${getStatusClass()} ${className}`}>
            <div className="sync-status__header">
                <span className="sync-status__icon">{getStatusIcon()}</span>
                <span className="sync-status__text">{getStatusText()}</span>

                {(status.pendingChanges > 0 || status.conflicts > 0) && (
                    <div className="sync-status__actions">
                        {status.pendingChanges > 0 && (
                            <button
                                className="sync-status__button sync-status__button--sync"
                                onClick={onSyncClick}
                                disabled={status.isSyncing || status.networkStatus === 'offline'}
                            >
                                立即同步
                            </button>
                        )}

                        {status.conflicts > 0 && (
                            <button
                                className="sync-status__button sync-status__button--resolve"
                                onClick={onResolveConflicts}
                            >
                                解决冲突
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="sync-status__details">
                <div className="sync-status__detail">
                    <span className="sync-status__label">网络状态:</span>
                    <span className={`sync-status__value sync-status__value--${status.networkStatus}`}>
                        {status.networkStatus === 'online' ? '在线' : '离线'}
                    </span>
                </div>

                <div className="sync-status__detail">
                    <span className="sync-status__label">待同步:</span>
                    <span className="sync-status__value">{status.pendingChanges} 个变更</span>
                </div>

                <div className="sync-status__detail">
                    <span className="sync-status__label">冲突:</span>
                    <span className="sync-status__value">{status.conflicts} 个</span>
                </div>

                <div className="sync-status__detail">
                    <span className="sync-status__label">最后同步:</span>
                    <span className="sync-status__value">{formatLastSyncTime()}</span>
                </div>
            </div>

            {status.error && (
                <div className="sync-status__error">
                    <span className="sync-status__error-icon">❌</span>
                    <span className="sync-status__error-text">{status.error}</span>
                </div>
            )}
        </div>
    );
};

export default SyncStatus;