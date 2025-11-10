/**
 * 语音识别相关类型定义
 */

/**
 * 语音识别状态
 */
export interface VoiceRecognitionState {
    isListening: boolean;
    isProcessing: boolean;
    recognitionResult: string;
    confidence: number;
    error: string | null;
    audioLevel: number;
}

/**
 * 语音命令配置
 */
export interface VoiceCommand {
    id: string;
    command: string;
    description: string;
    action: () => void;
    enabled: boolean;
}

/**
 * 语音识别配置
 */
export interface VoiceRecognitionConfig {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    audioFormat: 'wav' | 'mp3' | 'ogg';
}

/**
 * 语音识别请求
 */
export interface VoiceRecognitionRequest {
    audioData: string; // base64编码的音频数据
    audioFormat: 'wav' | 'mp3' | 'ogg';
    language: string;
}

/**
 * 语音识别响应
 */
export interface VoiceRecognitionResponse {
    text: string;
    confidence: number;
    language: string;
    duration: number;
}

/**
 * 语音合成请求
 */
export interface VoiceSynthesisRequest {
    text: string;
    voiceName?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
}

/**
 * 语音合成响应
 */
export interface VoiceSynthesisResponse {
    audioData: string; // base64编码的音频数据
    duration: number;
}

/**
 * 语音意图分析结果
 */
export interface VoiceIntentAnalysis {
    intent: string;
    confidence: number;
    entities: Record<string, any>;
}

/**
 * 语音识别Hook返回值
 */
export interface UseVoiceRecognitionReturn {
    isListening: boolean;
    recognitionResult: string;
    confidence: number;
    error: string | null;
    audioLevel: number;
    startListening: () => void;
    stopListening: () => void;
    clearResult: () => void;
}

/**
 * 语音命令Hook返回值
 */
export interface UseVoiceCommandsReturn {
    commands: VoiceCommand[];
    registerCommand: (command: Omit<VoiceCommand, 'id'>) => void;
    unregisterCommand: (commandId: string) => void;
    enableCommand: (commandId: string) => void;
    disableCommand: (commandId: string) => void;
    executeCommand: (commandId: string) => void;
    processVoiceText: (text: string) => string | null;
    analyzeIntent: (text: string) => VoiceIntentAnalysis;
    addIntent: (intent: string, keywords: string[], confidence?: number) => void;
    removeIntent: (intent: string) => void;
    clearCommands: () => void;
    getRegisteredCommands: () => Array<{ id: string; pattern: string; enabled: boolean }>;
}

/**
 * 语音识别组件Props
 */
export interface VoiceRecognitionProps {
    onResult?: (result: string, confidence: number) => void;
    onError?: (error: string) => void;
    onListeningChange?: (isListening: boolean) => void;
    continuous?: boolean;
    autoStart?: boolean;
    showControls?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * 语音命令面板组件Props
 */
export interface VoiceCommandsPanelProps {
    commands: VoiceCommand[];
    onCommandClick?: (command: VoiceCommand) => void;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * 语音合成Hook返回值
 */
export interface UseVoiceSynthesisReturn {
    isSpeaking: boolean;
    isLoading: boolean;
    error: string | null;
    speak: (text: string, options?: Partial<VoiceSynthesisRequest>) => Promise<void>;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    setVolume: (volume: number) => void;
    speakFeedback: (type: 'success' | 'error' | 'info' | 'warning', message: string, context?: any) => Promise<void>;
    preload: (text: string, options?: Partial<VoiceSynthesisConfig>) => Promise<void>;
    playPreloaded: () => Promise<void>;
    getPlaybackStatus: () => { isPlaying: boolean; currentTime: number; duration: number };
    getAvailableVoices: () => Array<{ name: string; description: string; language: string }>;
    setConfig: (newConfig: Partial<VoiceSynthesisConfig>) => void;
}

/**
 * 语音合成配置
 */
export interface VoiceSynthesisConfig {
    voiceName: string;
    speed: number;
    volume: number;
    pitch: number;
}

/**
 * 语音服务错误类型
 */
export interface VoiceServiceError {
    code: string;
    message: string;
    details?: any;
}

// 所有类型都已通过命名导出