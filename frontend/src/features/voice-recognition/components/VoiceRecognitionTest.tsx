import React from 'react';
import { Button, Space, Card, Alert, Statistic } from 'antd';
import { AudioOutlined, StopOutlined, ClearOutlined } from '@ant-design/icons';
import useIflytekVoice from '../hooks/useIflytekVoice';

const VoiceRecognitionTest: React.FC = () => {
    const {
        isSupported,
        isListening,
        transcript,
        error,
        isConnecting,
        audioChunkCount,
        confidence,
        isWebSocketConnected,
        startRecognition,
        stopRecognition,
        clearTranscript,
        clearError
    } = useIflytekVoice({
        onTextChange: (text: string, isFinal?: boolean) => {
            console.log(`[转录结果] 文本: "${text}", 是否最终结果: ${isFinal}`);
        },
        onError: (errorMsg: string) => {
            console.error(`[语音识别错误] ${errorMsg}`);
        },
        onStart: () => {
            console.log('[语音识别] 开始监听');
        },
        onStop: () => {
            console.log('[语音识别] 停止监听');
        }
    });

    const handleStart = async () => {
        try {
            await startRecognition();
        } catch (error) {
            console.error('启动语音识别失败:', error);
        }
    };

    const handleStop = () => {
        stopRecognition();
    };

    if (!isSupported) {
        return (
            <Card title="语音识别测试" style={{ width: 600, margin: '20px auto' }}>
                <Alert
                    message="浏览器不支持语音识别功能"
                    description="请使用支持WebRTC和WebSocket的现代浏览器（如Chrome、Firefox、Edge等）"
                    type="warning"
                    showIcon
                />
            </Card>
        );
    }

    return (
        <Card title="语音识别测试" style={{ width: 600, margin: '20px auto' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* 状态信息 */}
                <div>
                    <Space size="large">
                        <Statistic title="连接状态" value={isWebSocketConnected ? '已连接' : '未连接'} />
                        <Statistic title="监听状态" value={isListening ? '监听中' : '未监听'} />
                        <Statistic title="音频块数" value={audioChunkCount} />
                        <Statistic title="置信度" value={confidence} precision={2} />
                    </Space>
                </div>

                {/* 错误显示 */}
                {error && (
                    <Alert
                        message="语音识别错误"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={clearError}
                    />
                )}

                {/* 控制按钮 */}
                <Space>
                    <Button
                        type="primary"
                        icon={<AudioOutlined />}
                        onClick={handleStart}
                        disabled={isListening || isConnecting}
                        loading={isConnecting}
                    >
                        {isConnecting ? '连接中...' : '开始录音'}
                    </Button>
                    <Button
                        danger
                        icon={<StopOutlined />}
                        onClick={handleStop}
                        disabled={!isListening}
                    >
                        停止录音
                    </Button>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={clearTranscript}
                        disabled={!transcript}
                    >
                        清空文本
                    </Button>
                </Space>

                {/* 转录结果 */}
                <Card type="inner" title="转录结果">
                    <div style={{
                        minHeight: 100,
                        padding: 16,
                        border: '1px solid #d9d9d9',
                        borderRadius: 6,
                        backgroundColor: '#fafafa'
                    }}>
                        {transcript || (isListening ? '请开始说话...' : '点击开始录音按钮开始语音识别')}
                    </div>
                </Card>

                {/* 调试信息 */}
                <Card type="inner" title="调试信息" size="small">
                    <Space direction="vertical">
                        <div>WebSocket连接: {isWebSocketConnected ? '✅ 已连接' : '❌ 未连接'}</div>
                        <div>音频处理状态: {isListening ? '✅ 运行中' : '❌ 未运行'}</div>
                        <div>音频块计数: {audioChunkCount}</div>
                        <div>连接状态: {isConnecting ? '连接中...' : '就绪'}</div>
                    </Space>
                </Card>
            </Space>
        </Card>
    );
};

export default VoiceRecognitionTest;