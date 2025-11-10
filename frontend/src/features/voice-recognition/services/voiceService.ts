import axios from 'axios';
import {
    VoiceRecognitionRequest,
    VoiceRecognitionResponse,
    VoiceSynthesisRequest,
    VoiceSynthesisResponse,
    VoiceIntentAnalysis,
    VoiceServiceError
} from '../types/voice.types';

/**
 * 语音识别服务
 * 提供与后端语音API的通信功能
 */
export class VoiceService {
    private baseURL: string;

    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
    }

    /**
     * 语音转文本
     */
    async transcribeSpeech(request: VoiceRecognitionRequest): Promise<VoiceRecognitionResponse> {
        try {
            const response = await axios.post(`${this.baseURL}/ai/voice/transcribe`, request);
            return response.data;
        } catch (error) {
            throw this.handleError(error, '语音转文本失败');
        }
    }

    /**
     * 文本转语音
     */
    async generateSpeech(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
        try {
            const response = await axios.post(`${this.baseURL}/ai/voice/generate`, request);
            return response.data;
        } catch (error) {
            throw this.handleError(error, '文本转语音失败');
        }
    }

    /**
     * 分析语音意图
     */
    async analyzeVoiceIntent(audioData: string, context?: string): Promise<VoiceIntentAnalysis> {
        try {
            const response = await axios.post(`${this.baseURL}/ai/voice/intent`, {
                audioData,
                context
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error, '语音意图分析失败');
        }
    }

    /**
     * 检查语音服务状态
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseURL}/ai/voice/health`);
            return response.data.healthy;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取支持的语音列表
     */
    async getAvailableVoices(): Promise<Array<{ id: string; name: string; language: string }>> {
        try {
            const response = await axios.get(`${this.baseURL}/ai/voice/voices`);
            return response.data.voices;
        } catch (error) {
            // 返回默认语音列表
            return [
                { id: 'xiaoyan', name: '小燕', language: 'zh-CN' },
                { id: 'xiaoyu', name: '小宇', language: 'zh-CN' },
                { id: 'catherine', name: '凯瑟琳', language: 'en-US' }
            ];
        }
    }

    /**
     * 处理音频数据转换
     */
    async processAudioData(audioBlob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result as string;
                // 移除data URL前缀
                const base64 = base64Data.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });
    }

    /**
     * 播放音频数据
     */
    playAudio(audioData: string): void {
        const audio = new Audio(`data:audio/wav;base64,${audioData}`);
        audio.play().catch(error => {
            console.error('播放音频失败:', error);
        });
    }

    /**
     * 处理错误
     */
    private handleError(error: any, defaultMessage: string): VoiceServiceError {
        if (axios.isAxiosError(error)) {
            return {
                code: error.response?.data?.code || 'VOICE_SERVICE_ERROR',
                message: error.response?.data?.message || defaultMessage,
                details: error.response?.data
            };
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: defaultMessage,
            details: error
        };
    }
}

// 创建默认实例
export const voiceService = new VoiceService();

export default VoiceService;