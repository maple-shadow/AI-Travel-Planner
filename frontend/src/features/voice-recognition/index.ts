// 语音识别模块入口文件
// 导出所有公共API和组件

// 组件导出
export { default as VoiceRecognition } from './components/VoiceRecognition';
export { default as VoiceCommandsPanel } from './components/VoiceCommandsPanel';
export { default as VoiceRecognitionPage } from './pages/VoiceRecognitionPage';

// Hook导出
export { default as useVoiceRecognition } from './hooks/useVoiceRecognition';
export { default as useVoiceCommands } from './hooks/useVoiceCommands';
export { default as useVoiceSynthesis } from './hooks/useVoiceSynthesis';
export { defaultVoiceCommands } from './hooks/useVoiceCommands';

// 服务导出
export { default as voiceService } from './services/voiceService';

// 工具函数导出
export { AudioRecorder, AudioConverter, AudioPlayer, AudioAnalyzer } from './utils/audio.utils';
export {
  VoiceCommandProcessor,
  VoiceIntentAnalyzer,
  RecognitionResultProcessor,
  VoiceFeedbackGenerator
} from './utils/voice.utils';

// 导出所有类型
export type {
  // 基础类型
  VoiceRecognitionState,
  VoiceCommand,
  VoiceRecognitionConfig,
  VoiceSynthesisConfig,

  // 组件Props
  VoiceRecognitionProps,
  VoiceCommandsPanelProps,

  // Hook返回类型
  UseVoiceRecognitionReturn,
  UseVoiceCommandsReturn,
  UseVoiceSynthesisReturn,

  // 服务类型
  VoiceRecognitionRequest,
  VoiceRecognitionResponse,
  VoiceSynthesisRequest,
  VoiceSynthesisResponse,

  // 工具类型
  VoiceIntentAnalysis,
  VoiceServiceError
} from './types/voice.types';

/**
 * 语音识别模块初始化函数
 * 用于在应用启动时初始化语音识别模块
 */
export const initializeVoiceRecognition = async (): Promise<boolean> => {
  try {
    console.log('初始化语音识别模块...');

    // 检查浏览器是否支持Web Audio API
    if (!window.AudioContext) {
      throw new Error('浏览器不支持Web Audio API');
    }

    // 检查浏览器是否支持MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('浏览器不支持媒体设备访问');
    }

    // 检查麦克风权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      throw new Error('麦克风权限被拒绝或不可用');
    }

    console.log('语音识别模块初始化成功');
    return true;
  } catch (error) {
    console.error('语音识别模块初始化失败:', error);
    return false;
  }
};

/**
 * 语音识别模块状态检查
 * 检查模块是否可用
 */
export const checkVoiceRecognitionStatus = () => {
  const status = {
    webAudioAPI: !!window.AudioContext,
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    microphonePermission: null as boolean | null
  };

  // 异步检查麦克风权限
  if (status.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        status.microphonePermission = true;
      })
      .catch(() => {
        status.microphonePermission = false;
      });
  }

  return status;
};

/**
 * 语音识别模块版本信息
 */
export const VOICE_RECOGNITION_VERSION = '1.0.0';

export const VOICE_RECOGNITION_FEATURES = [
  '实时语音识别',
  '语音命令系统',
  '文本转语音',
  '意图分析',
  '自定义命令',
  '历史记录',
  '多语言支持'
];

/**
 * 默认语音识别配置
 */
export const DEFAULT_VOICE_CONFIG = {
  recognition: {
    language: 'zh-CN',
    continuous: false,
    interimResults: false,
    maxAlternatives: 1,
    audioFormat: 'wav' as const
  },
  synthesis: {
    voiceName: 'xiaoyan',
    speed: 50,
    volume: 80,
    pitch: 50
  }
};

/**
 * 预定义的语音命令类别
 */
export const VOICE_COMMAND_CATEGORIES = {
  NAVIGATION: ['开始录音', '停止录音', '显示命令', '显示识别'],
  SYSTEM: ['帮助', '清空结果', '清空历史'],
  TRAVEL: ['计划行程', '查看预算', '搜索目的地', '添加目的地'],
  UTILITY: ['天气查询', '时间查询', '汇率转换']
};

/**
 * 语音识别模块使用示例
 */
export const usageExamples = {
  basic: `
import { useVoiceRecognition } from './voice-recognition';

function MyComponent() {
  const { isListening, recognitionResult, startListening, stopListening } = useVoiceRecognition();
  
  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? '停止' : '开始'}录音
      </button>
      {recognitionResult && <p>识别结果: {recognitionResult}</p>}
    </div>
  );
}
  `,

  withCommands: `
import { useVoiceRecognition, useVoiceCommands } from './voice-recognition';

function MyComponent() {
  const { recognitionResult } = useVoiceRecognition();
  const { processVoiceText } = useVoiceCommands();
  
  React.useEffect(() => {
    if (recognitionResult) {
      const command = processVoiceText(recognitionResult);
      if (command) {
        console.log('执行命令:', command);
      }
    }
  }, [recognitionResult, processVoiceText]);
  
  return <div>...</div>;
}
  `,

  withSynthesis: `
import { useVoiceSynthesis } from './voice-recognition';

function MyComponent() {
  const { speak, isSpeaking } = useVoiceSynthesis();
  
  const handleSpeak = async () => {
    await speak('你好，这是一个语音合成示例');
  };
  
  return (
    <div>
      <button onClick={handleSpeak} disabled={isSpeaking}>
        {isSpeaking ? '播放中...' : '播放语音'}
      </button>
    </div>
  );
}
  `
};