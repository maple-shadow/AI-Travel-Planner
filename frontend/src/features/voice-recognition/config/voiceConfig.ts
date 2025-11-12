/**
 * 语音识别配置
 * 基于科大讯飞语音识别服务的配置参数
 */

// 语音识别服务配置
export const VOICE_RECOGNITION_CONFIG = {
    // WebSocket服务地址
    WS_URL: 'ws://localhost:8000/api/v1/speech/transcribe',

    // 音频配置
    AUDIO: {
        sampleRate: 16000,        // 16kHz采样率
        channelCount: 1,         // 单声道
        echoCancellation: true,  // 回声消除
        noiseSuppression: true   // 降噪
    },

    // 音频处理参数
    PROCESSING: {
        bufferSize: 512,         // 缓冲区大小（samples）
        frameInterval: 32,       // 帧间隔（ms）
        chunkSize: 1280         // 每帧字节数
    },

    // 连接配置
    CONNECTION: {
        timeout: 10000,         // 连接超时时间（ms）
        reconnectAttempts: 3,   // 重连尝试次数
        reconnectDelay: 2000    // 重连延迟（ms）
    },

    // 错误处理配置
    ERROR_HANDLING: {
        maxAudioChunks: 1000,   // 最大音频块数量
        maxTranscriptLength: 1000 // 最大转录文本长度
    }
} as const;

// 浏览器支持检测
export const BROWSER_SUPPORT = {
    required: {
        webSocket: 'WebSocket' in window,
        mediaDevices: 'mediaDevices' in navigator,
        audioContext: 'AudioContext' in window || 'webkitAudioContext' in window
    },

    recommended: {
        browser: ['Chrome', 'Edge', 'Firefox', 'Safari'],
        version: {
            Chrome: 66,
            Edge: 79,
            Firefox: 76,
            Safari: 12.1
        }
    }
} as const;

// 语音识别状态常量
export const VOICE_RECOGNITION_STATES = {
    IDLE: 'idle',
    CONNECTING: 'connecting',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    ERROR: 'error',
    COMPLETED: 'completed'
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
    BROWSER_NOT_SUPPORTED: '您的浏览器不支持语音识别功能，请使用Chrome、Edge、Firefox或Safari浏览器',
    MICROPHONE_PERMISSION_DENIED: '麦克风权限被拒绝，请允许网站访问麦克风',
    MICROPHONE_NOT_AVAILABLE: '麦克风不可用，请检查设备连接',
    WEBSOCKET_CONNECTION_FAILED: '语音识别服务连接失败，请检查网络连接和后端服务',
    AUDIO_PROCESSING_FAILED: '音频处理失败，请重试',
    SERVICE_UNAVAILABLE: '语音识别服务不可用，请稍后重试'
} as const;

// 语音识别语言配置
export const LANGUAGE_CONFIG = {
    CHINESE: {
        code: 'zh-CN',
        name: '中文',
        dialect: '普通话'
    },
    ENGLISH: {
        code: 'en-US',
        name: '英语',
        dialect: '美式英语'
    }
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
    language: LANGUAGE_CONFIG.CHINESE.code,
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
} as const;

export default VOICE_RECOGNITION_CONFIG;