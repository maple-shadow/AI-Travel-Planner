/**
 * 语音识别类型定义
 */

// 语音识别配置
interface VoiceRecognitionConfig {
    sampleRate?: number;
    channelCount?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    language?: string;
}

// 语音识别结果
interface RecognitionResult {
    success: boolean;
    transcript?: string;
    is_final?: boolean;
    confidence?: number;
    error?: string;
}

// 语音识别状态
interface VoiceRecognitionState {
    isSupported: boolean;
    isListening: boolean;
    isConnecting: boolean;
    transcript: string;
    error: string | null;
    audioChunkCount: number;
    confidence: number;
}

// Hook 选项
interface UseVoiceRecognitionOptions {
    onTextChange?: (text: string, isFinal?: boolean) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onStop?: () => void;
    config?: VoiceRecognitionConfig;
}

// 语音识别Hook返回值
interface UseVoiceRecognitionReturn {
    // 状态
    isSupported: boolean;
    isListening: boolean;
    isConnecting: boolean;
    transcript: string;
    error: string | null;
    audioChunkCount: number;
    confidence: number;

    // 方法
    startRecognition: () => Promise<void>;
    stopRecognition: () => void;
    clearTranscript: () => void;
    clearError: () => void;
}

// WebSocket消息类型
interface WebSocketMessage {
    type: 'audio' | 'control' | 'result';
    data: any;
}

// 音频数据块
interface AudioChunk {
    data: ArrayBuffer;
    timestamp: number;
    sequence: number;
}

export type {
    VoiceRecognitionConfig,
    RecognitionResult,
    VoiceRecognitionState,
    UseVoiceRecognitionOptions,
    UseVoiceRecognitionReturn,
    WebSocketMessage,
    AudioChunk
};