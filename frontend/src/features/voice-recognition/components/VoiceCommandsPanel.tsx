import React, { useState } from 'react';
import { VoiceCommandsPanelProps, VoiceCommand } from '../types/voice.types';
import './VoiceCommandsPanel.css';

/**
 * 语音命令面板组件
 * 显示和管理所有可用的语音命令
 */
const VoiceCommandsPanel: React.FC<VoiceCommandsPanelProps> = ({
    commands,
    onCommandClick,
    className = '',
    style
}) => {
    const [showEnabledOnly, setShowEnabledOnly] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCommand, setNewCommand] = useState<Partial<VoiceCommand>>({
        command: '',
        description: '',
        enabled: true
    });

    // 基本函数实现
    const enableCommand = (commandId: string) => {
        console.log('启用命令:', commandId);
    };

    const disableCommand = (commandId: string) => {
        console.log('禁用命令:', commandId);
    };

    const executeCommand = (commandId: string): boolean => {
        const command = commands.find(cmd => cmd.id === commandId);
        if (command && command.enabled) {
            command.action();
            return true;
        }
        return false;
    };

    const registerCommand = (command: Omit<VoiceCommand, 'id'>) => {
        console.log('注册命令:', command);
    };

    const unregisterCommand = (commandId: string) => {
        console.log('注销命令:', commandId);
    };

    /**
     * 过滤命令
     */
    const filteredCommands = commands.filter(cmd => {
        const matchesSearch = cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (showEnabledOnly) {
            return matchesSearch && cmd.enabled;
        }

        return matchesSearch;
    });

    /**
     * 切换命令状态
     */
    const toggleCommand = (commandId: string, enabled: boolean) => {
        if (enabled) {
            enableCommand(commandId);
        } else {
            disableCommand(commandId);
        }
    };

    /**
     * 执行命令
     */
    const handleExecuteCommand = (commandId: string) => {
        const command = commands.find(cmd => cmd.id === commandId);
        const success: boolean = executeCommand(commandId);
        if (success && onCommandClick && command) {
            onCommandClick(command);
        }
    };

    /**
     * 添加新命令
     */
    const handleAddCommand = () => {
        if (newCommand.command && newCommand.description) {
            registerCommand({
                command: newCommand.command,
                description: newCommand.description,
                action: newCommand.action || (() => {
                    console.log(`执行自定义命令: ${newCommand.command}`);
                }),
                enabled: newCommand.enabled || true
            });

            setNewCommand({
                command: '',
                description: '',
                enabled: true
            });
            setShowAddForm(false);
        }
    };

    /**
     * 删除命令
     */
    const handleDeleteCommand = (commandId: string) => {
        if (window.confirm('确定要删除这个命令吗？')) {
            unregisterCommand(commandId);
        }
    };

    /**
     * 获取命令状态标签
     */
    const getStatusLabel = (enabled: boolean) => {
        return enabled ? (
            <span className="status-enabled">已启用</span>
        ) : (
            <span className="status-disabled">已禁用</span>
        );
    };

    /**
     * 获取命令类型标签
     */
    const getCommandType = (command: string) => {
        if (command.includes('开始') || command.includes('启动')) {
            return 'start';
        } else if (command.includes('停止') || command.includes('结束')) {
            return 'stop';
        } else if (command.includes('搜索') || command.includes('查找')) {
            return 'search';
        } else if (command.includes('查看') || command.includes('显示')) {
            return 'view';
        } else if (command.includes('添加') || command.includes('创建')) {
            return 'add';
        } else if (command.includes('删除') || command.includes('移除')) {
            return 'delete';
        }
        return 'default';
    };

    return (
        <div className={`voice-commands-panel ${className}`} style={style}>
            {/* 面板标题和搜索 */}
            <div className="panel-header">
                <h3 className="panel-title">语音命令</h3>
                <div className="panel-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="搜索命令..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    <button
                        className="btn btn-toggle"
                        onClick={() => setShowEnabledOnly(!showEnabledOnly)}
                    >
                        {showEnabledOnly ? '显示全部' : '仅显示已启用'}
                    </button>
                    <button
                        className="btn btn-add"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <span className="btn-icon">+</span>
                        添加命令
                    </button>
                </div>
            </div>

            {/* 添加命令表单 */}
            {showAddForm && (
                <div className="add-command-form">
                    <h4>添加新命令</h4>
                    <div className="form-group">
                        <label>命令文本:</label>
                        <input
                            type="text"
                            value={newCommand.command}
                            onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                            placeholder="例如: 开始录音"
                        />
                    </div>
                    <div className="form-group">
                        <label>命令描述:</label>
                        <input
                            type="text"
                            value={newCommand.description}
                            onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                            placeholder="例如: 开始语音识别"
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={newCommand.enabled || true}
                                onChange={(e) => setNewCommand({ ...newCommand, enabled: e.target.checked })}
                            />
                            启用命令
                        </label>
                    </div>
                    <div className="form-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleAddCommand}
                            disabled={!newCommand.command || !newCommand.description}
                        >
                            添加
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowAddForm(false)}
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}

            {/* 命令列表 */}
            <div className="commands-list">
                {filteredCommands.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🎤</span>
                        <p>没有找到匹配的命令</p>
                        {searchTerm && (
                            <button
                                className="btn btn-link"
                                onClick={() => setSearchTerm('')}
                            >
                                清除搜索
                            </button>
                        )}
                    </div>
                ) : (
                    filteredCommands.map((cmd) => (
                        <div
                            key={cmd.id}
                            className={`command-item ${!cmd.enabled ? 'disabled' : ''}`}
                        >
                            <div className="command-info">
                                <div className="command-header">
                                    <span className={`command-type ${getCommandType(cmd.command)}`}>
                                        {getCommandType(cmd.command)}
                                    </span>
                                    <span className="command-text">{cmd.command}</span>
                                </div>
                                <div className="command-description">{cmd.description}</div>
                                <div className="command-status">
                                    {getStatusLabel(cmd.enabled)}
                                </div>
                            </div>

                            <div className="command-actions">
                                <button
                                    className={`btn btn-sm ${cmd.enabled ? 'btn-execute' : 'btn-disabled'}`}
                                    onClick={() => handleExecuteCommand(cmd.id)}
                                    disabled={!cmd.enabled}
                                >
                                    执行
                                </button>

                                <button
                                    className="btn btn-sm btn-toggle"
                                    onClick={() => toggleCommand(cmd.id, !cmd.enabled)}
                                >
                                    {cmd.enabled ? '禁用' : '启用'}
                                </button>

                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteCommand(cmd.id)}
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 统计信息 */}
            <div className="panel-footer">
                <div className="stats">
                    <span>总命令: {commands.length}</span>
                    <span>已启用: {commands.filter(cmd => cmd.enabled).length}</span>
                    <span>已禁用: {commands.filter(cmd => !cmd.enabled).length}</span>
                </div>
            </div>
        </div>
    );
};

export default VoiceCommandsPanel;