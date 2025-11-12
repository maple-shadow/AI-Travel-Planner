import { useState, useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';
import type { VoiceRecognitionConfig, UseVoiceRecognitionOptions } from '../types';

interface UseIflytekVoiceOptions extends UseVoiceRecognitionOptions {
    config?: VoiceRecognitionConfig;
}

interface VoiceRecognitionState {
    isSupported: boolean;
    isListening: boolean;
    transcript: string;
    error: string | null;
    isConnecting: boolean;
    audioChunkCount: number;
    confidence: number;
    isWebSocketConnected: boolean;
}

// AudioWorklet 处理器代码（内联）
const AUDIO_WORKLET_PROCESSOR = `
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.isProcessing = false;
        this.sampleRate = 16000; // 明确设置采样率
        this.port.onmessage = (event) => {
            const { type } = event.data;
            console.log('[AudioWorklet] 收到消息:', type);
            
            if (type === 'start') {
                this.isProcessing = true;
                console.log('[AudioWorklet] 开始处理音频数据');
            } else if (type === 'stop') {
                this.isProcessing = false;
                console.log('[AudioWorklet] 停止处理音频数据');
            } else if (type === 'ping') {
                console.log('[AudioWorklet] 收到ping消息，处理器状态正常');
                this.port.postMessage({ type: 'pong' });
            }
        };
    }

    process(inputs, outputs, parameters) {
        // 根据MDN规范，process方法必须返回布尔值
        // 返回true表示继续处理，返回false表示停止处理
        
        if (!this.isProcessing) {
            return true; // 如果未开始处理，继续等待
        }
        
        console.log('[AudioWorklet] process方法被调用，inputs数量:', inputs.length);
        
        const input = inputs[0];
        if (input && input.length > 0) {
            console.log('[AudioWorklet] 输入通道数量:', input.length);
            const inputData = input[0]; // 第一个通道
            
            console.log('[AudioWorklet] 接收到音频数据，长度:', inputData.length, '样本值范围:', {
                min: Math.min(...inputData.slice(0, 10)),
                max: Math.max(...inputData.slice(0, 10))
            });
            
            // 将 Float32 音频数据转换为 Int16 PCM
            const pcmData = this.float32ToInt16(inputData);
            
            console.log('[AudioWorklet] 转换后的PCM数据长度:', pcmData.length, '样本值范围:', {
                min: Math.min(...Array.from(pcmData.slice(0, 10))),
                max: Math.max(...Array.from(pcmData.slice(0, 10)))
            });
            
            // 发送音频数据到主线程
            this.port.postMessage({
                type: 'audioData',
                data: pcmData,
                sampleRate: this.sampleRate
            });
            
            console.log('[AudioWorklet] 已发送音频数据到主线程');
        } else {
            console.log('[AudioWorklet] 没有接收到音频数据，inputs结构:', {
                inputsLength: inputs.length,
                input0: input ? input.length : 'undefined',
                input0Data: input && input[0] ? input[0].length : 'undefined'
            });
        }
        
        // 始终返回true，除非明确要停止处理
        return this.isProcessing;
    }

    float32ToInt16(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const val = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
        }
        return int16Array;
    }
}

registerProcessor('audio-processor', AudioProcessor);
`;

/**
 * 科大讯飞语音识别Hook
 * 基于WebSocket连接Python语音后端服务进行实时语音识别
 * 参考SpeechTestView.vue实现：使用ScriptProcessorNode进行音频处理
 */
export const useIflytekVoice = (options: UseIflytekVoiceOptions = {}) => {
    const {
        onStart,
        onStop,
        onTextChange,
        onError
    } = options;

    const [state, setState] = useState<VoiceRecognitionState>({
        isSupported: false,
        isListening: false,
        transcript: '',
        error: null,
        isConnecting: false,
        audioChunkCount: 0,
        confidence: 0,
        isWebSocketConnected: false
    });

    const isMountedRef = useRef(true);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // WebSocket连接URL（Python语音后端）
    const WS_URL = import.meta.env.VITE_VOICE_WS_URL || 'ws://localhost:8000/api/v1/speech/transcribe';

    // 检查浏览器支持情况
    const checkBrowserSupport = useCallback(() => {
        const isWebSocketSupported = 'WebSocket' in window;
        const isMediaDevicesSupported = 'mediaDevices' in navigator;
        const isAudioContextSupported = 'AudioContext' in window || 'webkitAudioContext' in window;

        return isWebSocketSupported && isMediaDevicesSupported && isAudioContextSupported;
    }, []);

    // 初始化WebSocket连接
    const initializeWebSocket = useCallback(async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            console.log(`[WebSocket连接] 开始连接WebSocket: ${WS_URL}`);
            console.log(`[WebSocket连接] 连接时间: ${new Date().toISOString()}`);

            // 如果已有连接且状态正常，直接使用现有连接
            if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                console.log('[WebSocket连接] 使用现有连接');
                setState(prev => ({ ...prev, isWebSocketConnected: true, error: null }));
                resolve();
                return;
            }

            // 如果已有连接但状态不正常，先关闭
            if (websocketRef.current) {
                console.log('[WebSocket连接] 关闭异常连接');
                websocketRef.current.close();
                websocketRef.current = null;
            }

            // 创建新的WebSocket连接
            websocketRef.current = new WebSocket(WS_URL);

            // 设置连接超时
            const connectionTimeout = setTimeout(() => {
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.CONNECTING) {
                    console.error('WebSocket连接超时');
                    websocketRef.current.close();
                    const errorMsg = `WebSocket连接超时 (${WS_URL})，请检查语音后端服务是否正常运行`;
                    setState(prev => ({
                        ...prev,
                        isWebSocketConnected: false,
                        error: errorMsg
                    }));
                    onError?.(errorMsg);
                    reject(new Error(errorMsg));
                }
            }, 10000); // 增加超时时间到10秒

            websocketRef.current.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket连接成功');
                console.log(`[WebSocket连接] URL: ${WS_URL}, 连接时间: ${new Date().toISOString()}`);
                setState(prev => ({ ...prev, isWebSocketConnected: true, error: null }));
                resolve();
            };

            websocketRef.current.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.error('WebSocket连接错误:', error);
                const errorMsg = `WebSocket连接失败 (${WS_URL})，请检查：\n1. Python语音后端服务是否启动\n2. 端口8000是否被占用\n3. 防火墙设置`;
                setState(prev => ({
                    ...prev,
                    isWebSocketConnected: false,
                    error: errorMsg
                }));
                onError?.(errorMsg);
                reject(new Error(errorMsg));
            };

            websocketRef.current.onclose = (event) => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket连接关闭:', event.code, event.reason);

                // 只有在用户主动停止录音时才设置isListening为false
                // 避免在连接意外断开时影响录音状态
                if (event.code === 1000) { // 正常关闭
                    setState(prev => ({
                        ...prev,
                        isWebSocketConnected: false,
                        isListening: false
                    }));
                } else {
                    // 异常关闭，保持录音状态，允许重连
                    setState(prev => ({
                        ...prev,
                        isWebSocketConnected: false
                    }));
                }
            };

            // 设置消息处理
            websocketRef.current.onmessage = (event) => {
                try {
                    console.log(`[WebSocket消息接收] 时间: ${new Date().toISOString()}, 数据大小: ${event.data.length} bytes`);
                    const data = JSON.parse(event.data);
                    console.log('收到WebSocket消息:', data);

                    if (data.success && data.transcript) {
                        setState(prev => ({
                            ...prev,
                            transcript: data.transcript,
                            confidence: data.confidence || 0.9
                        }));

                        onTextChange?.(data.transcript, data.is_final || false);

                        if (data.is_final) {
                            message.success('语音识别完成');
                        }
                    } else if (data.error) {
                        const errorMsg = `转录错误: ${data.error}`;
                        setState(prev => ({ ...prev, error: errorMsg }));
                        onError?.(errorMsg);
                    }
                } catch (error) {
                    console.error('解析WebSocket消息错误:', error);
                    const errorMsg = '解析转录结果时出错';
                    setState(prev => ({ ...prev, error: errorMsg }));
                    onError?.(errorMsg);
                }
            };
        });
    }, [onTextChange, onError]);

    // 初始化语音识别
    const initializeRecognition = useCallback(async () => {
        if (!checkBrowserSupport()) {
            setState(prev => ({ ...prev, isSupported: false, error: '浏览器不支持语音识别功能' }));
            return false;
        }

        try {
            setState(prev => ({ ...prev, isConnecting: true, error: null }));

            // 初始化WebSocket连接
            await initializeWebSocket();

            // 获取麦克风权限
            console.log('[麦克风权限] 开始请求麦克风权限...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            console.log('[麦克风权限] 麦克风权限获取成功');
            console.log('[麦克风信息] 音频轨道数量:', stream.getAudioTracks().length);

            // 检查音频流状态
            if (!stream) {
                console.error("[音频流错误] 无法获取音频流");
                setState(prev => ({
                    ...prev,
                    isListening: false,
                    error: "无法获取麦克风权限或音频流"
                }));
                return;
            }

            // 详细检查音频流状态
            console.log(`[音频流检查] 音频流获取成功，轨道数量: ${stream.getTracks().length}`);
            stream.getTracks().forEach((track, index) => {
                console.log(`[音频轨道${index}] id: ${track.id}, kind: ${track.kind}, label: ${track.label}, enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);
            });

            // 检查音频轨道信息
            const audioTracks = stream.getAudioTracks();
            console.log(`[音频流检查] 音频轨道数量: ${audioTracks.length}`);

            audioTracks.forEach((track, index) => {
                console.log(`[音频轨道${index}] id: ${track.id}, kind: ${track.kind}, label: ${track.label}, enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);
            });

            // 检查是否有有效的音频轨道
            if (audioTracks.length === 0) {
                console.error('[音频流检查] 没有找到音频轨道');
                throw new Error('没有找到有效的音频轨道');
            }

            mediaStreamRef.current = stream;

            // 创建AudioContext
            console.log('[AudioWorklet] 开始创建AudioContext...');
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            console.log('[AudioContext] AudioContext创建成功，状态:', audioContext.state, '采样率:', audioContext.sampleRate);

            // 等待AudioContext恢复
            if (audioContext.state === 'suspended') {
                console.log('[AudioContext] AudioContext被挂起，正在恢复...');
                await audioContext.resume();
                console.log('[AudioContext] AudioContext恢复完成，状态:', audioContext.state);
            }

            // 创建AudioWorklet处理器
            console.log('[AudioWorklet] 创建AudioWorklet处理器...');
            const blob = new Blob([AUDIO_WORKLET_PROCESSOR], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            try {
                await audioContext.audioWorklet.addModule(url);
                console.log('[AudioWorklet] AudioWorklet处理器加载成功');
            } catch (error) {
                console.error('[AudioWorklet] AudioWorklet处理器加载失败:', error);
                // 回退到ScriptProcessorNode
                console.log('[AudioWorklet] 回退到ScriptProcessorNode...');
                return await initializeWithScriptProcessor(stream);
            } finally {
                URL.revokeObjectURL(url);
            }

            // 创建音频源节点
            const sourceNode = audioContext.createMediaStreamSource(stream);
            sourceNodeRef.current = sourceNode;

            // 创建AudioWorklet节点
            const audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');
            audioWorkletRef.current = audioWorkletNode;

            // 设置音频数据处理回调
            audioWorkletNode.port.onmessage = (event) => {
                const { type, data, sampleRate } = event.data;
                console.log(`[AudioWorklet回调] 收到消息，类型: ${type}, 数据长度: ${data?.length}, 采样率: ${sampleRate}`);

                if (type === 'audioData' && data && data.length > 0) {
                    console.log(`[AudioWorklet] 接收到音频数据，长度: ${data.length}, 采样率: ${sampleRate}`);

                    // 发送音频数据到WebSocket
                    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                        try {
                            // 将Int16Array转换为ArrayBuffer
                            const arrayBuffer = data.buffer;
                            websocketRef.current.send(arrayBuffer);

                            // 更新音频块计数
                            setState(prev => ({
                                ...prev,
                                audioChunkCount: prev.audioChunkCount + 1
                            }));

                            console.log(`[音频发送] 时间: ${new Date().toISOString()}, 数据大小: ${arrayBuffer.byteLength} bytes`);
                        } catch (error) {
                            console.error('[音频发送错误]', error);
                        }
                    } else {
                        console.warn(`[音频发送失败] WebSocket状态: ${websocketRef.current?.readyState}, 连接状态: ${state.isWebSocketConnected}`);
                    }
                } else if (type === 'pong') {
                    console.log('[AudioWorklet回调] 收到pong消息，AudioWorklet处理器连接正常');
                } else {
                    console.log(`[AudioWorklet回调] 收到非音频数据消息: ${type}`);
                }
            };

            // 连接音频节点
            sourceNode.connect(audioWorkletNode);
            audioWorkletNode.connect(audioContext.destination);

            console.log('[AudioWorklet] 音频处理管道初始化成功');
            console.log('[AudioWorklet] 音频节点连接状态:', {
                sourceNode: !!sourceNode,
                audioWorkletNode: !!audioWorkletNode,
                audioContext: audioContext.state
            });

            // 检查音频流状态
            console.log('[AudioWorklet] 音频流状态检查:', {
                streamActive: stream.active,
                audioTracks: stream.getAudioTracks().length,
                track0: stream.getAudioTracks()[0] ? {
                    enabled: stream.getAudioTracks()[0].enabled,
                    muted: stream.getAudioTracks()[0].muted,
                    readyState: stream.getAudioTracks()[0].readyState
                } : '无音频轨道'
            });

            // 添加AudioWorklet节点详细信息
            console.log('[AudioWorklet] AudioWorklet节点详细信息:', {
                numberOfInputs: audioWorkletNode.numberOfInputs,
                numberOfOutputs: audioWorkletNode.numberOfOutputs,
                channelCount: audioWorkletNode.channelCount,
                channelCountMode: audioWorkletNode.channelCountMode,
                channelInterpretation: audioWorkletNode.channelInterpretation
            });

            setState(prev => ({ ...prev, isConnecting: false }));
            return true;

        } catch (error) {
            console.error('语音识别初始化失败:', error);
            const errorMsg = error instanceof Error ? error.message : '获取麦克风权限失败';
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: errorMsg
            }));
            onError?.(errorMsg);
            return false;
        }
    }, [checkBrowserSupport, initializeWebSocket, onError]);

    // 使用ScriptProcessorNode作为备选方案
    const initializeWithScriptProcessor = async (stream: MediaStream): Promise<boolean> => {
        console.log('[ScriptProcessor] 使用ScriptProcessorNode处理音频...');

        try {
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const sourceNode = audioContext.createMediaStreamSource(stream);
            sourceNodeRef.current = sourceNode;

            // 创建ScriptProcessorNode（已弃用但作为备选方案）
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);

                // 将Float32音频数据转换为Int16 PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const val = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
                }

                // 发送音频数据到WebSocket
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    try {
                        websocketRef.current.send(pcmData.buffer);

                        setState(prev => ({
                            ...prev,
                            audioChunkCount: prev.audioChunkCount + 1
                        }));

                        console.log(`[ScriptProcessor] 发送音频数据，大小: ${pcmData.buffer.byteLength} bytes`);
                    } catch (error) {
                        console.error('[ScriptProcessor音频发送错误]', error);
                    }
                }
            };

            // 连接音频节点
            sourceNode.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            console.log('[ScriptProcessor] 音频处理管道初始化成功');
            return true;

        } catch (error) {
            console.error('[ScriptProcessor] 初始化失败:', error);
            return false;
        }
    };

    // 开始语音识别
    const startRecognition = useCallback(async () => {
        if (state.isListening) {
            console.log('[语音识别] 已在监听状态，无需重复启动');
            return;
        }

        try {
            console.log('[语音识别] 开始语音识别');
            console.log(`[语音识别状态] 当前状态: isListening=${state.isListening}, isWebSocketConnected=${state.isWebSocketConnected}`);
            console.log('[语音识别] 开始初始化语音识别...');

            // 初始化语音识别
            const initialized = await initializeRecognition();
            if (!initialized) {
                throw new Error('语音识别初始化失败');
            }

            // 检查AudioContext状态并恢复
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                console.log('[AudioContext] 恢复AudioContext...');
                await audioContextRef.current.resume();
            }

            console.log('[语音识别] 初始化成功，开始实时转录');

            // 发送开始消息给AudioWorklet处理器
            if (audioWorkletRef.current) {
                audioWorkletRef.current.port.postMessage({ type: 'start' });
                console.log('[AudioWorklet] 已发送开始消息，启动音频处理');

                // 强制触发一次音频处理，确保AudioWorklet开始工作
                setTimeout(() => {
                    console.log('[AudioWorklet] 强制触发音频处理检查');
                    if (audioWorkletRef.current) {
                        audioWorkletRef.current.port.postMessage({ type: 'ping' });
                    }
                }, 100);
            }

            setState(prev => ({
                ...prev,
                isListening: true,
                error: null,
                transcript: '',
                audioChunkCount: 0
            }));

            onStart?.();
            console.log('实时语音转录已开始，请说话...');

        } catch (error) {
            console.error('启动语音识别失败:', error);
            const errorMsg = error instanceof Error ? error.message : '启动语音识别失败';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
            throw error;
        }
    }, [state.isListening, initializeRecognition, onStart, onError]);

    // 停止语音识别
    const stopRecognition = useCallback(async () => {
        if (!state.isListening) {
            console.log('[语音识别] 当前未在监听状态，无需停止');
            return;
        }

        try {
            console.log('[语音识别] 准备停止语音识别...');

            // 更新React状态
            setState(prev => ({
                ...prev,
                isListening: false,
                isWebSocketConnected: false
            }));

            // 发送停止消息给AudioWorklet处理器
            if (audioWorkletRef.current) {
                audioWorkletRef.current.port.postMessage({ type: 'stop' });
                console.log('[AudioWorklet] 已发送停止消息，停止音频处理');
            }

            // 断开音频节点连接
            if (sourceNodeRef.current && audioWorkletRef.current) {
                console.log('[AudioWorklet] 断开音频节点连接...');
                sourceNodeRef.current.disconnect();
                audioWorkletRef.current.disconnect();
            }

            // 关闭AudioContext
            if (audioContextRef.current) {
                console.log('[AudioContext] 关闭AudioContext...');
                audioContextRef.current.close().then(() => {
                    console.log('[AudioContext] AudioContext已关闭');
                }).catch(error => {
                    console.error('[AudioContext] 关闭失败:', error);
                });
                audioContextRef.current = null;
            }

            // 发送结束标记并关闭WebSocket连接（仅在用户主动停止录音时）
            if (websocketRef.current) {
                if (websocketRef.current.readyState === WebSocket.OPEN) {
                    websocketRef.current.send(JSON.stringify({ action: 'end' }));
                    console.log('[WebSocket] 已发送结束标记');
                }

                // 用户主动停止录音时，关闭WebSocket连接
                websocketRef.current.close(1000, '用户停止录音');
                websocketRef.current = null;
                console.log('[WebSocket] 连接已关闭（用户主动停止录音）');
            }

            // 停止媒体流
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }

            onStop?.();
            console.log('语音识别已停止');

        } catch (error) {
            console.error('停止语音识别失败:', error);
            const errorMsg = error instanceof Error ? error.message : '停止语音识别失败';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
        }
    }, [state.isListening, onStop, onError]);

    // 清空转录文本
    const clearTranscript = useCallback(() => {
        setState(prev => ({ ...prev, transcript: '' }));
        onTextChange?.('', false);
    }, [onTextChange]);

    // 组件卸载时清理资源
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;

            // 停止语音识别
            if (state.isListening) {
                stopRecognition();
            }

            // 注意：组件卸载时不自动关闭WebSocket连接，保持连接持久性
            // 只有在用户主动停止录音时才会关闭WebSocket连接
            // 这样可以避免频繁建立和断开连接，提高性能

            // 断开音频节点连接
            if (sourceNodeRef.current && audioWorkletRef.current) {
                try {
                    sourceNodeRef.current.disconnect();
                    audioWorkletRef.current.disconnect();
                } catch (error) {
                    console.error('[AudioWorklet] 断开连接失败:', error);
                }
            }

            // 关闭音频上下文
            if (audioContextRef.current) {
                try {
                    audioContextRef.current.close();
                } catch (error) {
                    console.error('[AudioContext] 关闭失败:', error);
                }
                audioContextRef.current = null;
            }

            // 注意：组件卸载时不关闭WebSocket连接，保持连接持久性
            // 只有在用户主动停止录音时才会关闭WebSocket连接
            // 这样可以避免频繁建立和断开连接，提高性能
            // websocketRef.current 不在这里关闭，只在 stopRecognition 中关闭

            // 停止媒体流
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }

            // 清理引用（除了WebSocket连接）
            sourceNodeRef.current = null;
            audioWorkletRef.current = null;
            // websocketRef.current 保持连接状态
        };
    }, [state.isListening, stopRecognition]);

    // 检查浏览器支持状态
    useEffect(() => {
        const supported = checkBrowserSupport();
        setState(prev => ({ ...prev, isSupported: supported }));
    }, [checkBrowserSupport]);

    return {
        // 状态
        isSupported: state.isSupported,
        isListening: state.isListening,
        transcript: state.transcript,
        error: state.error,
        isConnecting: state.isConnecting,
        audioChunkCount: state.audioChunkCount,
        confidence: state.confidence,
        isWebSocketConnected: state.isWebSocketConnected,

        // 方法
        startRecognition,
        stopRecognition,
        clearTranscript,

        // 重置错误
        clearError: () => setState(prev => ({ ...prev, error: null }))
    };
};

export default useIflytekVoice;