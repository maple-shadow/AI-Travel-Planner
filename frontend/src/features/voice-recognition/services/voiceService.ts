/**
 * 语音识别服务
 * 处理与后端语音服务的WebSocket通信
 */

interface VoiceRecognitionConfig {
    sampleRate?: number;
    channelCount?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
}

interface RecognitionResult {
    success: boolean;
    transcript?: string;
    is_final?: boolean;
    confidence?: number;
    error?: string;
}

class VoiceRecognitionService {
    private ws: WebSocket | null = null;
    private mediaStream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private audioProcessor: ScriptProcessorNode | null = null;
    private isConnected = false;
    private isProcessing = false;
    private audioChunkCount = 0;

    /**
     * 初始化语音识别服务
     */
    async initialize(config: VoiceRecognitionConfig = {}): Promise<boolean> {
        try {
            const {
                sampleRate = 16000,
                channelCount = 1,
                echoCancellation = true,
                noiseSuppression = true
            } = config;

            // 获取麦克风权限
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate,
                    channelCount,
                    echoCancellation,
                    noiseSuppression
                }
            });

            // 创建音频上下文
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass({ sampleRate });

            // 创建音频源
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // 创建音频处理器（每32ms处理一次，512 samples at 16kHz）
            this.audioProcessor = this.audioContext.createScriptProcessor(512, 1, 1);

            // 连接音频处理链
            source.connect(this.audioProcessor);
            this.audioProcessor.connect(this.audioContext.destination);

            return true;
        } catch (error) {
            console.error('语音识别服务初始化失败:', error);
            throw error;
        }
    }

    /**
     * 连接到语音识别服务
     */
    async connect(url: string = 'ws://localhost:8000/api/v1/speech/transcribe'): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }

            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('语音识别服务连接成功');
                this.isConnected = true;
                resolve();
            };

            this.ws.onerror = (error) => {
                console.error('语音识别服务连接错误:', error);
                this.isConnected = false;
                reject(new Error('语音识别服务连接失败'));
            };

            this.ws.onclose = () => {
                console.log('语音识别服务连接关闭');
                this.isConnected = false;
                this.isProcessing = false;
            };
        });
    }

    /**
     * 开始语音识别
     */
    async startRecognition(
        onResult: (result: RecognitionResult) => void,
        onError?: (error: string) => void
    ): Promise<void> {
        if (!this.isConnected || !this.ws) {
            throw new Error('语音识别服务未连接');
        }

        if (this.isProcessing) {
            throw new Error('语音识别正在进行中');
        }

        this.isProcessing = true;
        this.audioChunkCount = 0;

        // 设置WebSocket消息处理
        this.ws.onmessage = (event) => {
            try {
                const result = JSON.parse(event.data) as RecognitionResult;
                console.log('收到语音识别结果:', result);
                onResult(result);
            } catch (error) {
                console.error('解析语音识别结果失败:', error);
                onError?.('解析语音识别结果失败');
            }
        };

        // 设置音频处理回调
        if (this.audioProcessor) {
            this.audioProcessor.onaudioprocess = (event) => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isProcessing) {
                    // 获取音频数据
                    const inputData = event.inputBuffer.getChannelData(0);

                    // 转换为16位PCM格式
                    const pcmData = this.float32ToPCM(inputData);

                    // 发送音频数据
                    this.ws.send(pcmData);
                    this.audioChunkCount++;
                }
            };
        }

        console.log('语音识别开始');
    }

    /**
     * 停止语音识别
     */
    stopRecognition(): void {
        this.isProcessing = false;

        // 发送结束标记
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: 'end' }));
        }

        console.log('语音识别停止');
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.stopRecognition();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        // 清理音频资源
        if (this.audioProcessor) {
            this.audioProcessor.disconnect();
            this.audioProcessor = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        this.isConnected = false;
        console.log('语音识别服务已断开连接');
    }

    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isProcessing: this.isProcessing,
            audioChunkCount: this.audioChunkCount
        };
    }

    /**
     * 检查浏览器支持情况
     */
    static checkBrowserSupport(): boolean {
        const isWebSocketSupported = 'WebSocket' in window;
        const isMediaDevicesSupported = 'mediaDevices' in navigator;
        const isAudioContextSupported = 'AudioContext' in window || 'webkitAudioContext' in window;

        return isWebSocketSupported && isMediaDevicesSupported && isAudioContextSupported;
    }

    /**
     * 将Float32音频数据转换为16位PCM格式
     */
    private float32ToPCM(float32Array: Float32Array): Uint8Array {
        const buffer = new ArrayBuffer(float32Array.length * 2); // 16位 = 2字节
        const view = new DataView(buffer);

        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return new Uint8Array(buffer);
    }
}

// 创建全局语音识别服务实例
export const voiceService = new VoiceRecognitionService();

export default VoiceRecognitionService;