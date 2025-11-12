// Voice recognition feature module
import useIflytekVoice from './hooks/useIflytekVoice';
import { voiceService } from './services/voiceService';
import VOICE_RECOGNITION_CONFIG, {
    BROWSER_SUPPORT,
    VOICE_RECOGNITION_STATES,
    ERROR_MESSAGES,
    LANGUAGE_CONFIG,
    DEFAULT_CONFIG
} from './config/voiceConfig';
import type {
    VoiceRecognitionConfig,
    RecognitionResult,
    VoiceRecognitionState,
    UseVoiceRecognitionOptions,
    UseVoiceRecognitionReturn,
    WebSocketMessage,
    AudioChunk
} from './types';

/**
 * 语音识别模块主入口
 * 基于科大讯飞API的实时语音识别功能
 */

export const initializeVoiceRecognition = async (config?: VoiceRecognitionConfig): Promise<boolean> => {
    console.log('Voice recognition initialized - 科大讯飞语音识别服务');

    // 检查浏览器支持情况
    const supported = checkBrowserSupport();
    if (!supported) {
        console.warn('浏览器不支持语音识别功能');
        return false;
    }

    try {
        // 初始化语音服务
        await voiceService.initialize(config);
        return true;
    } catch (error) {
        console.error('语音识别初始化失败:', error);
        return false;
    }
};

/**
 * 检查浏览器支持情况
 */
export const checkBrowserSupport = (): boolean => {
    return BROWSER_SUPPORT.required.webSocket &&
        BROWSER_SUPPORT.required.mediaDevices &&
        BROWSER_SUPPORT.required.audioContext;
};

/**
 * 开始语音识别
 */
export const startVoiceRecognition = async (
    onResult: (result: RecognitionResult) => void,
    onError?: (error: string) => void
) => {
    try {
        console.log('Voice recognition started - 连接到科大讯飞语音服务');

        // 确保服务已初始化
        if (!voiceService.getStatus().isConnected) {
            await voiceService.connect(VOICE_RECOGNITION_CONFIG.WS_URL);
        }

        // 开始识别
        await voiceService.startRecognition(onResult, onError);
        return { success: true };
    } catch (error) {
        console.error('Failed to start voice recognition:', error);
        const errorMsg = error instanceof Error ? error.message : '启动语音识别失败';
        return { success: false, error: errorMsg };
    }
};

/**
 * 停止语音识别
 */
export const stopVoiceRecognition = () => {
    voiceService.stopRecognition();
    console.log('Voice recognition stopped');
};

/**
 * 断开语音识别服务
 */
export const disconnectVoiceRecognition = () => {
    voiceService.disconnect();
    console.log('Voice recognition disconnected');
};

/**
 * 检查语音识别支持情况
 */
export const isVoiceRecognitionSupported = () => {
    return checkBrowserSupport();
};

/**
 * 获取语音识别状态
 */
export const getVoiceRecognitionStatus = () => {
    const status = voiceService.getStatus();
    return {
        isSupported: checkBrowserSupport(),
        isInitialized: true,
        isConnected: status.isConnected,
        isProcessing: status.isProcessing,
        audioChunkCount: status.audioChunkCount,
        service: '科大讯飞语音识别'
    };
};

/**
 * 获取推荐浏览器信息
 */
export const getRecommendedBrowsers = () => {
    return {
        browsers: BROWSER_SUPPORT.recommended.browser,
        versions: BROWSER_SUPPORT.recommended.version
    };
};

/**
 * 获取错误消息
 */
export const getErrorMessage = (errorType: keyof typeof ERROR_MESSAGES): string => {
    return ERROR_MESSAGES[errorType];
};

/**
 * 获取语言配置
 */
export const getLanguageConfig = () => {
    return LANGUAGE_CONFIG;
};

// 导出所有模块
export {
    // Hook
    useIflytekVoice,

    // 服务
    voiceService,

    // 配置
    VOICE_RECOGNITION_CONFIG,
    BROWSER_SUPPORT,
    VOICE_RECOGNITION_STATES,
    ERROR_MESSAGES,
    LANGUAGE_CONFIG,
    DEFAULT_CONFIG
};

// 导出类型
export type {
    VoiceRecognitionConfig,
    RecognitionResult,
    VoiceRecognitionState,
    UseVoiceRecognitionOptions,
    UseVoiceRecognitionReturn,
    WebSocketMessage,
    AudioChunk
};

export default useIflytekVoice;