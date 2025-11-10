import React, { useState } from 'react';
import VoiceRecognition from '../components/VoiceRecognition';
import VoiceCommandsPanel from '../components/VoiceCommandsPanel';
import { useVoiceCommands, defaultVoiceCommands } from '../hooks/useVoiceCommands';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { VoiceCommand } from '../types/voice.types';
import './VoiceRecognitionPage.css';

/**
 * 语音识别页面
 * 提供完整的语音识别功能界面
 */
const VoiceRecognitionPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'recognition' | 'commands'>('recognition');
    const [recognitionHistory, setRecognitionHistory] = useState<Array<{
        id: string;
        text: string;
        confidence: number;
        timestamp: Date;
    }>>([]);

    // 语音命令Hook
    const {
        commands,
        registerCommand
    } = useVoiceCommands();

    // 语音合成Hook
    const { speak } = useVoiceSynthesis();

    /**
     * 初始化默认命令
     */
    React.useEffect(() => {
        // 注册默认命令
        defaultVoiceCommands.forEach((cmd) => {
            registerCommand(cmd);
        });

        // 注册页面特定的命令
        registerCommand({
            command: '显示命令',
            description: '显示语音命令面板',
            action: () => setActiveTab('commands'),
            enabled: true
        });

        registerCommand({
            command: '显示识别',
            description: '显示语音识别面板',
            action: () => setActiveTab('recognition'),
            enabled: true
        });

        registerCommand({
            command: '清空历史',
            description: '清空识别历史记录',
            action: () => setRecognitionHistory([]),
            enabled: true
        });

    }, [registerCommand]);

    /**
     * 处理识别结果
     */
    const handleRecognitionResult = (text: string, confidence: number) => {
        const newRecord = {
            id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text,
            confidence,
            timestamp: new Date()
        };

        setRecognitionHistory(prev => [newRecord, ...prev.slice(0, 49)]); // 最多保留50条记录

        // 根据置信度提供语音反馈
        if (confidence > 0.8) {
            speak(`识别成功，置信度${Math.round(confidence * 100)}%`);
        } else if (confidence > 0.6) {
            speak(`识别完成，置信度${Math.round(confidence * 100)}%`);
        }
    };

    /**
     * 处理识别错误
     */
    const handleRecognitionError = (error: string) => {
        console.error('语音识别错误:', error);
        // 可以在这里添加错误处理逻辑
    };

    /**
     * 处理监听状态变化
     */
    const handleListeningChange = (isListening: boolean) => {
        console.log('监听状态:', isListening ? '开始' : '停止');
    };

    /**
     * 处理命令点击
     */
    const handleCommandClick = (command: VoiceCommand) => {
        console.log('命令执行:', command.command);
        speak('命令已执行');
    };

    /**
     * 格式化时间
     */
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    /**
     * 获取置信度颜色
     */
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return '#4CAF50';
        if (confidence >= 0.6) return '#FF9800';
        return '#F44336';
    };

    return (
        <div className="voice-recognition-page">
            {/* 页面标题 */}
            <div className="page-header">
                <h1 className="page-title">语音识别系统</h1>
                <p className="page-subtitle">使用科大讯飞语音识别API，提供智能语音交互功能</p>
            </div>

            {/* 标签页导航 */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'recognition' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recognition')}
                >
                    <span className="tab-icon">🎤</span>
                    语音识别
                </button>
                <button
                    className={`tab-button ${activeTab === 'commands' ? 'active' : ''}`}
                    onClick={() => setActiveTab('commands')}
                >
                    <span className="tab-icon">📋</span>
                    语音命令
                </button>
            </div>

            {/* 标签页内容 */}
            <div className="tab-content">
                {activeTab === 'recognition' && (
                    <div className="recognition-tab">
                        <div className="recognition-section">
                            <h3 className="section-title">实时语音识别</h3>
                            <VoiceRecognition
                                onResult={handleRecognitionResult}
                                onError={handleRecognitionError}
                                onListeningChange={handleListeningChange}
                                continuous={false}
                                showControls={true}
                                className="main-recognition"
                            />
                        </div>

                        {/* 识别历史 */}
                        <div className="history-section">
                            <h3 className="section-title">识别历史</h3>
                            <div className="history-controls">
                                <span className="history-count">
                                    共 {recognitionHistory.length} 条记录
                                </span>
                                {recognitionHistory.length > 0 && (
                                    <button
                                        className="btn btn-clear-history"
                                        onClick={() => setRecognitionHistory([])}
                                    >
                                        🗑️ 清空历史
                                    </button>
                                )}
                            </div>

                            <div className="history-list">
                                {recognitionHistory.length === 0 ? (
                                    <div className="empty-history">
                                        <span className="empty-icon">📝</span>
                                        <p>暂无识别记录</p>
                                        <small>开始语音识别后，识别结果将显示在这里</small>
                                    </div>
                                ) : (
                                    recognitionHistory.map(record => (
                                        <div key={record.id} className="history-item">
                                            <div className="history-content">
                                                <div className="history-text">{record.text}</div>
                                                <div className="history-meta">
                                                    <span
                                                        className="confidence-badge"
                                                        style={{ backgroundColor: getConfidenceColor(record.confidence) }}
                                                    >
                                                        {(record.confidence * 100).toFixed(1)}%
                                                    </span>
                                                    <span className="timestamp">{formatTime(record.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'commands' && (
                    <div className="commands-tab">
                        <VoiceCommandsPanel
                            commands={commands}
                            onCommandClick={handleCommandClick}
                            className="main-commands-panel"
                        />
                    </div>
                )}
            </div>

            {/* 页面底部信息 */}
            <div className="page-footer">
                <div className="footer-info">
                    <h4>使用说明</h4>
                    <ul>
                        <li>点击"开始"按钮开始语音识别</li>
                        <li>说出语音命令来执行相应操作</li>
                        <li>在"语音命令"标签页查看所有可用命令</li>
                        <li>支持自定义语音命令的添加和管理</li>
                    </ul>
                </div>

                <div className="footer-tech">
                    <h4>技术特性</h4>
                    <ul>
                        <li>基于科大讯飞语音识别API</li>
                        <li>支持中文普通话识别</li>
                        <li>实时音频处理和反馈</li>
                        <li>智能意图分析和命令匹配</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecognitionPage;