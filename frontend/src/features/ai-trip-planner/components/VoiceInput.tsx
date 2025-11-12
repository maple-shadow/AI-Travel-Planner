import React, { useState } from 'react';
import { Button, Space, message, Typography, Progress, Alert, Tag, Card, Row, Col, Input } from 'antd';
import { AudioOutlined, AudioMutedOutlined, WifiOutlined, ReloadOutlined } from '@ant-design/icons';
import useIflytekVoice from '@/features/voice-recognition/hooks/useIflytekVoice';

const { Text } = Typography;
const { TextArea } = Input;

interface VoiceInputProps {
    onTextChange: (text: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

/**
 * 语音输入组件
 * 支持科大讯飞语音识别和文本输入，基于WebSocket实时通信
 * 参考SpeechTestView.vue实现实时语音转录功能
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
    onTextChange,
    // placeholder = "请说出您的旅行需求...", // 已注释，因为未使用
    disabled = false
}) => {
    const [recognitionProgress, setRecognitionProgress] = useState(0);
    const [isFinalResult, setIsFinalResult] = useState(false);

    // 使用语音识别Hook
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
        clearTranscript
    } = useIflytekVoice({
        onTextChange: (text: string, isFinal?: boolean) => {
            onTextChange(text);
            setIsFinalResult(isFinal || false);

            if (isFinal) {
                setRecognitionProgress(100);
                setTimeout(() => setRecognitionProgress(0), 2000);
                message.success('语音识别完成');
            } else {
                setRecognitionProgress(70);
            }
        },
        onError: (errorMsg: string) => {
            message.error(errorMsg);
        },
        onStart: () => {
            message.info('语音识别已开始，请说话...');
        },
        onStop: () => {
            message.info('语音识别已停止');
        }
    });

    // toggleListening函数已注释，因为未使用
    // const toggleListening = async () => {
    //     if (!isSupported) {
    //         message.warning('您的浏览器不支持语音识别功能');
    //         return;
    //     }
    //
    //     if (isConnecting) {
    //         return; // 正在连接中，避免重复点击
    //     }
    //
    //     // 立即切换状态，避免异步延迟
    //     if (isListening) {
    //         // 停止语音识别
    //         stopRecognition();
    //     } else {
    //         // 开始语音识别
    //         clearTranscript();
    //
    //         try {
    //             await startRecognition();
    //         } catch (error) {
    //             console.error('启动语音识别失败:', error);
    //             message.error('启动语音识别失败，请检查麦克风权限和后端服务');
    //             // 如果启动失败，确保状态正确重置
    //             stopRecognition();
    //         }
    //     }
    // };

    // handleTextChange函数已注释，因为未使用
    // const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const text = e.target.value;
    //     onTextChange(text);
    // };

    // 浏览器不支持语音识别
    if (!isSupported) {
        return (
            <Alert
                message="浏览器不支持语音识别"
                description="请使用Chrome、Edge或Safari等现代浏览器"
                type="warning"
                showIcon
            />
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <Card
                title="实时语音转录"
                style={{ marginBottom: 20 }}
                extra={
                    <Space>
                        <WifiOutlined style={{
                            color: isWebSocketConnected ? '#52c41a' : isConnecting ? '#faad14' : '#ff4d4f'
                        }} />
                        <Text type="secondary">
                            {isWebSocketConnected ? '语音服务已连接' : isConnecting ? '连接中...' : '语音服务未连接'}
                        </Text>
                    </Space>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {/* 连接状态信息 */}
                            {isWebSocketConnected && (
                                <div style={{ textAlign: 'center' }}>
                                    <Tag color="green">WebSocket已连接，正在实时转录中...</Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            音频格式: 16kHz, 16位, 单声道PCM | 发送间隔: 40ms/块 (1280 samples)
                                        </Text>
                                    </div>
                                </div>
                            )}

                            {/* 语音识别控制 */}
                            <div style={{ textAlign: 'center' }}>
                                <Space>
                                    <Button
                                        type={isListening ? "primary" : "default"}
                                        danger={isListening}
                                        icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
                                        onClick={isListening ? stopRecognition : startRecognition}
                                        disabled={disabled || isConnecting}
                                        loading={isConnecting}
                                        size="large"
                                    >
                                        {isListening ? "停止录音" : "开始录音"}
                                    </Button>

                                    <Button
                                        onClick={clearTranscript}
                                        disabled={!transcript}
                                        icon={<ReloadOutlined />}
                                        size="large"
                                    >
                                        清空结果
                                    </Button>
                                </Space>
                            </div>

                            {/* 识别进度 */}
                            {recognitionProgress > 0 && (
                                <Progress
                                    percent={recognitionProgress}
                                    status={recognitionProgress === 100 ? "success" : "active"}
                                    size="small"
                                    showInfo={false}
                                />
                            )}

                            {/* 识别结果 */}
                            <div>
                                <Text strong>实时转录结果:</Text>
                                <TextArea
                                    value={transcript}
                                    readOnly
                                    placeholder="实时转录结果将显示在这里..."
                                    rows={4}
                                    style={{ marginTop: 8 }}
                                />
                                <div style={{ marginTop: 8 }}>
                                    {confidence > 0 && (
                                        <Text type="secondary" style={{ fontSize: 12, marginRight: 16 }}>
                                            当前置信度: {confidence}
                                        </Text>
                                    )}
                                    {isFinalResult && (
                                        <Text type="success" style={{ fontSize: 12, marginRight: 16 }}>
                                            ✓ 最终结果
                                        </Text>
                                    )}
                                    {audioChunkCount > 0 && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            已处理音频块: {audioChunkCount}
                                        </Text>
                                    )}
                                </div>
                            </div>

                            {/* 错误提示 */}
                            {error && (
                                <Alert
                                    message="语音识别错误"
                                    description={error}
                                    type="error"
                                    showIcon
                                    closable
                                    onClose={() => { }}
                                />
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default VoiceInput;