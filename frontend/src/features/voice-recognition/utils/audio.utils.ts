/**
 * 音频处理工具函数
 */

/**
 * 音频录制器类
 */
export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;

    /**
     * 初始化音频录制器
     */
    async initialize(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(this.stream);
            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            source.connect(this.analyser);

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

        } catch (error) {
            throw new Error(`初始化音频录制器失败: ${error}`);
        }
    }

    /**
     * 开始录制
     */
    startRecording(): void {
        if (!this.mediaRecorder) {
            throw new Error('音频录制器未初始化');
        }

        this.audioChunks = [];
        this.mediaRecorder.start(100); // 每100ms收集一次数据
    }

    /**
     * 停止录制
     */
    async stopRecording(): Promise<Blob> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                throw new Error('音频录制器未初始化');
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * 获取当前音量级别
     */
    getVolumeLevel(): number {
        if (!this.analyser || !this.dataArray) {
            return 0;
        }

        // 创建新的Uint8Array来避免类型错误
        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(frequencyData);

        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            sum += frequencyData[i];
        }

        const average = sum / frequencyData.length;
        // 将音量级别转换为0-100的范围
        return Math.min(Math.max((average / 128) * 100, 0), 100);
    }

    /**
     * 清理资源
     */
    cleanup(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.mediaRecorder = null;
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
    }
}

/**
 * 音频格式转换工具
 */
export class AudioConverter {
    /**
     * 将WebM格式转换为WAV格式
     */
    static async webmToWav(webmBlob: Blob): Promise<Blob> {
        // 这里可以使用第三方库进行格式转换
        // 目前返回原始blob，实际项目中需要实现格式转换
        return webmBlob;
    }

    /**
     * 将音频Blob转换为Base64字符串
     */
    static async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * 将Base64字符串转换为音频Blob
     */
    static base64ToBlob(base64: string, mimeType: string = 'audio/wav'): Blob {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }
}

/**
 * 音频播放器类
 */
export class AudioPlayer {
    private audioContext: AudioContext | null = null;
    private audioBuffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;
    private onEndedCallback: (() => void) | null = null;

    /**
     * 播放音频数据
     */
    async playAudioData(audioData: ArrayBuffer): Promise<void> {
        try {
            this.audioContext = new AudioContext();
            this.audioBuffer = await this.audioContext.decodeAudioData(audioData);

            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.connect(this.audioContext.destination);
            this.source.start();

            this.source.onended = () => {
                if (this.onEndedCallback) {
                    this.onEndedCallback();
                }
                this.cleanup();
            };

        } catch (error) {
            this.cleanup();
            throw new Error(`播放音频失败: ${error}`);
        }
    }

    /**
     * 播放Base64编码的音频
     */
    async playAudio(base64Data: string): Promise<void> {
        const audioData = this.base64ToArrayBuffer(base64Data);
        return this.playAudioData(audioData);
    }

    /**
     * 停止播放
     */
    stop(): void {
        this.cleanup();
    }

    /**
     * 暂停播放
     */
    pause(): void {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    /**
     * 恢复播放
     */
    resume(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 设置音量
     */
    setVolume(volume: number): void {
        // 音量设置需要创建增益节点
        if (this.audioContext && this.source) {
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume / 100;
            this.source.disconnect();
            this.source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
        }
    }

    /**
     * 预加载音频
     */
    async preload(base64Data: string): Promise<void> {
        const audioData = this.base64ToArrayBuffer(base64Data);
        this.audioContext = new AudioContext();
        this.audioBuffer = await this.audioContext.decodeAudioData(audioData);
    }

    /**
     * 播放预加载的音频
     */
    async playPreloaded(): Promise<void> {
        if (!this.audioContext || !this.audioBuffer) {
            throw new Error('没有预加载的音频');
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.audioContext.destination);
        this.source.start();

        this.source.onended = () => {
            if (this.onEndedCallback) {
                this.onEndedCallback();
            }
            this.cleanup();
        };
    }

    /**
     * 设置播放结束回调
     */
    onEnded(callback: () => void): void {
        this.onEndedCallback = callback;
    }

    /**
     * 获取播放状态
     */
    getPlaybackStatus(): { isPlaying: boolean; currentTime: number; duration: number } {
        return {
            isPlaying: this.audioContext ? this.audioContext.state === 'running' : false,
            currentTime: 0,
            duration: this.audioBuffer ? this.audioBuffer.duration : 0
        };
    }

    /**
     * 将Base64字符串转换为ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * 清理资源
     */
    private cleanup(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.audioBuffer = null;
        this.source = null;
        this.onEndedCallback = null;
    }
}

/**
 * 音频分析工具
 */
export class AudioAnalyzer {
    /**
     * 计算音频时长（估算）
     */
    static estimateDuration(audioData: ArrayBuffer, sampleRate: number = 16000): number {
        // 假设16位单声道音频
        const bytesPerSample = 2;
        const numSamples = audioData.byteLength / bytesPerSample;
        return numSamples / sampleRate;
    }

    /**
     * 检测静音
     */
    static detectSilence(audioData: ArrayBuffer, threshold: number = 0.01): boolean {
        const int16Array = new Int16Array(audioData);
        let sum = 0;

        for (let i = 0; i < int16Array.length; i++) {
            sum += Math.abs(int16Array[i]);
        }

        const average = sum / int16Array.length;
        return average < threshold * 32768; // 32768是16位音频的最大值
    }
}

export default {
    AudioRecorder,
    AudioConverter,
    AudioPlayer,
    AudioAnalyzer
};