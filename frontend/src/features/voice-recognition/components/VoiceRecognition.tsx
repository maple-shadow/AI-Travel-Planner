import React, { useState, useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { VoiceRecognitionProps } from '../types/voice.types';
import './VoiceRecognition.css';

/**
 * 语音识别组件
 * 提供完整的语音识别界面和功能
 */
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
    onResult,
    onError,
    onListeningChange,
    continuous = false,
    autoStart = false,
    showControls = true,
    className = '',
    style
}) => {
    // 语音识别Hook
    const {
        isListening,
        recognitionResult,
        confidence,
        error,
        audioLevel,
        startListening,
        stopListening,
        clearResult
    } = useVoiceRecognition({
        language: 'zh-CN',
        continuous: continuous || false,
        interimResults: false,
        maxAlternatives: 1,
        audioFormat: 'wav'
    });

    // 语音命令Hook
    const { processVoiceText, analyzeIntent } = useVoiceCommands();

    // 语音合成Hook
    const { speakFeedback } = useVoiceSynthesis();

    const [lastResult, setLastResult] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);

    /**
     * 处理识别结果
     */
    useEffect(() => {
        if (recognitionResult && recognitionResult !== lastResult) {
            setLastResult(recognitionResult);

            // 调用结果回调
            if (onResult) {
                onResult(recognitionResult, confidence);
            }

            // 处理语音命令
            const commandResult = processVoiceText(recognitionResult);
            if (commandResult) {
                // 显示命令执行反馈
                setShowFeedback(true);
                speakFeedback('success', `已执行命令: ${commandResult}`);
                setTimeout(() => setShowFeedback(false), 3000);
            }

            // 分析意图
            const intent = analyzeIntent(recognitionResult);
            if (intent.intent) {
                console.log('检测到意图:', intent);
            }
        }
    }, [recognitionResult, lastResult, confidence, onResult, processVoiceText, analyzeIntent, speakFeedback]);

    /**
     * 处理错误
     */
    useEffect(() => {
        if (error) {
            if (onError) {
                onError(error);
            }
            speakFeedback('error', `语音识别错误: ${error}`);
        }
    }, [error, onError, speakFeedback]);

    /**
     * 处理监听状态变化
     */
    useEffect(() => {
        if (onListeningChange) {
            onListeningChange(isListening);
        }
    }, [isListening, onListeningChange]);

    /**
     * 自动开始监听
     */
    useEffect(() => {
        if (autoStart && !isListening) {
            startListening();
        }
    }, [autoStart, isListening, startListening]);

    /**
     * 开始监听
     */
    const handleStartListening = async () => {
        try {
            await startListening();
            speakFeedback('info', '开始语音识别，请说话...');
        } catch (err) {
            console.error('开始监听失败:', err);
        }
    };

    /**
     * 停止监听
     */
    const handleStopListening = async () => {
        try {
            await stopListening();
            speakFeedback('info', '语音识别已停止');
        } catch (err) {
            console.error('停止监听失败:', err);
        }
    };

    /**
     * 清空结果
     */
    const handleClearResult = () => {
        clearResult();
        setLastResult('');
    };

    /**
     * 获取音频级别指示器
     */
    const getAudioLevelIndicator = () => {
        const level = Math.min(Math.max(audioLevel * 100, 0), 100);
        const bars = Math.ceil(level / 10);
        return Array.from({ length: 10 }, (_, i) => (
            <div
                key={i}
                className={`audio-bar ${i < bars ? 'active' : ''}`}
                style={{ height: `${(i + 1) * 10}%` }}
            />
        ));
    };

    /**
     * 获取置信度颜色
     */
    const getConfidenceColor = () => {
        if (confidence >= 0.8) return '#4CAF50';
        if (confidence >= 0.6) return '#FF9800';
        return '#F44336';
    };

    return (
        <div className={`voice-recognition ${className}`} style={style}>
            {/* 状态指示器 */}
            <div className="voice-status">
                <div className={`status-indicator ${isListening ? 'listening' : 'idle'}`}>
                    <div className="status-dot" />
                    <span className="status-text">
                        {isListening ? '正在监听...' : '准备就绪'}
                    </span>
                </div>

                {/* 音频级别指示器 */}
                {isListening && (
                    <div className="audio-level-indicator">
                        {getAudioLevelIndicator()}
                    </div>
                )}
            </div>

            {/* 识别结果 */}
            {recognitionResult && (
                <div className="recognition-result">
                    <div className="result-text">{recognitionResult}</div>
                    <div
                        className="confidence-bar"
                        style={{
                            width: `${confidence * 100}%`,
                            backgroundColor: getConfidenceColor()
                        }}
                    />
                    <div className="confidence-text">
                        置信度: {(confidence * 100).toFixed(1)}%
                    </div>
                </div>
            )}

            {/* 错误显示 */}
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* 命令反馈 */}
            {showFeedback && (
                <div className="command-feedback">
                    <span className="feedback-icon">✅</span>
                    命令已执行
                </div>
            )}

            {/* 控制按钮 */}
            {showControls && (
                <div className="control-buttons">
                    <button
                        className={`btn ${isListening ? 'btn-stop' : 'btn-start'}`}
                        onClick={isListening ? handleStopListening : handleStartListening}
                        disabled={isListening && continuous}
                    >
                        {isListening ? (
                            <>
                                <span className="btn-icon">⏹️</span>
                                停止
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">🎤</span>
                                开始
                            </>
                        )}
                    </button>

                    {recognitionResult && (
                        <button
                            className="btn btn-clear"
                            onClick={handleClearResult}
                        >
                            <span className="btn-icon">🗑️</span>
                            清空
                        </button>
                    )}
                </div>
            )}

            {/* 使用提示 */}
            <div className="usage-tips">
                <h4>语音命令示例:</h4>
                <ul>
                    <li>"开始录音" - 开始语音识别</li>
                    <li>"停止录音" - 停止语音识别</li>
                    <li>"计划行程" - 开始行程规划</li>
                    <li>"查看预算" - 查看预算分析</li>
                    <li>"搜索目的地" - 搜索旅游目的地</li>
                </ul>
            </div>
        </div>
    );
};

export default VoiceRecognition;