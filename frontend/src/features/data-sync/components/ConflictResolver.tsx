import React, { useState } from 'react';
import { SyncConflict } from '../types/sync.types';
import { ConflictUtils } from '../utils/conflict.utils';
import './ConflictResolver.css';

interface ConflictResolverProps {
    conflict: SyncConflict;
    onResolve: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => void;
    onCancel?: () => void;
    className?: string;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
    conflict,
    onResolve,
    onCancel,
    className = ''
}) => {
    const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge'>('local');
    const [isResolving, setIsResolving] = useState(false);

    const handleResolve = async () => {
        if (!ConflictUtils.validateResolution(conflict, selectedResolution)) {
            alert('无法合并删除操作，请选择保留本地或远程版本');
            return;
        }

        setIsResolving(true);
        try {
            await onResolve(conflict.id, selectedResolution);
        } finally {
            setIsResolving(false);
        }
    };



    const getChangeDescription = (change: any) => {
        switch (change.type) {
            case 'create': return '创建';
            case 'update': return '更新';
            case 'delete': return '删除';
            default: return change.type;
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`conflict-resolver ${className}`}>
            <div className="conflict-resolver__header">
                <h3 className="conflict-resolver__title">
                    ⚠️ 数据冲突
                </h3>
                <p className="conflict-resolver__description">
                    {ConflictUtils.generateConflictDescription(conflict)}
                </p>
            </div>

            <div className="conflict-resolver__content">
                <div className="conflict-resolver__changes">
                    <div className="conflict-resolver__change conflict-resolver__change--local">
                        <h4 className="conflict-resolver__change-title">本地版本</h4>
                        <div className="conflict-resolver__change-info">
                            <span className="conflict-resolver__change-type">
                                {getChangeDescription(conflict.localChange)}
                            </span>
                            <span className="conflict-resolver__change-time">
                                {formatTime(conflict.localChange.timestamp)}
                            </span>
                        </div>
                        <div className="conflict-resolver__change-data">
                            <pre>{JSON.stringify(conflict.localChange.data, null, 2)}</pre>
                        </div>
                    </div>

                    <div className="conflict-resolver__change conflict-resolver__change--remote">
                        <h4 className="conflict-resolver__change-title">远程版本</h4>
                        <div className="conflict-resolver__change-info">
                            <span className="conflict-resolver__change-type">
                                {getChangeDescription(conflict.remoteChange)}
                            </span>
                            <span className="conflict-resolver__change-time">
                                {formatTime(conflict.remoteChange.timestamp)}
                            </span>
                        </div>
                        <div className="conflict-resolver__change-data">
                            <pre>{JSON.stringify(conflict.remoteChange.data, null, 2)}</pre>
                        </div>
                    </div>
                </div>

                <div className="conflict-resolver__resolution">
                    <h4 className="conflict-resolver__resolution-title">选择解决方案</h4>

                    <div className="conflict-resolver__options">
                        <label className="conflict-resolver__option">
                            <input
                                type="radio"
                                name="resolution"
                                value="local"
                                checked={selectedResolution === 'local'}
                                onChange={(e) => setSelectedResolution(e.target.value as 'local')}
                            />
                            <span className="conflict-resolver__option-label">
                                <strong>保留本地版本</strong>
                                <span className="conflict-resolver__option-description">
                                    使用本地修改覆盖远程版本
                                </span>
                            </span>
                        </label>

                        <label className="conflict-resolver__option">
                            <input
                                type="radio"
                                name="resolution"
                                value="remote"
                                checked={selectedResolution === 'remote'}
                                onChange={(e) => setSelectedResolution(e.target.value as 'remote')}
                            />
                            <span className="conflict-resolver__option-label">
                                <strong>保留远程版本</strong>
                                <span className="conflict-resolver__option-description">
                                    使用远程版本覆盖本地修改
                                </span>
                            </span>
                        </label>

                        {conflict.localChange.type === 'update' && conflict.remoteChange.type === 'update' && (
                            <label className="conflict-resolver__option">
                                <input
                                    type="radio"
                                    name="resolution"
                                    value="merge"
                                    checked={selectedResolution === 'merge'}
                                    onChange={(e) => setSelectedResolution(e.target.value as 'merge')}
                                />
                                <span className="conflict-resolver__option-label">
                                    <strong>合并两个版本</strong>
                                    <span className="conflict-resolver__option-description">
                                        智能合并本地和远程的修改
                                    </span>
                                </span>
                            </label>
                        )}
                    </div>

                    {selectedResolution === 'merge' && (
                        <div className="conflict-resolver__preview">
                            <h5>合并预览</h5>
                            <div className="conflict-resolver__preview-content">
                                <pre>{JSON.stringify(
                                    ConflictUtils.mergeData(conflict.localChange.data, conflict.remoteChange.data),
                                    null, 2
                                )}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="conflict-resolver__actions">
                {onCancel && (
                    <button
                        className="conflict-resolver__button conflict-resolver__button--cancel"
                        onClick={onCancel}
                        disabled={isResolving}
                    >
                        取消
                    </button>
                )}

                <button
                    className="conflict-resolver__button conflict-resolver__button--resolve"
                    onClick={handleResolve}
                    disabled={isResolving}
                >
                    {isResolving ? '处理中...' : '确认解决'}
                </button>
            </div>
        </div>
    );
};

export default ConflictResolver;