import { useState, useCallback, useRef } from 'react';
import { voiceService } from '../services/voiceService';
import { AudioPlayer } from '../utils/audio.utils';
import { UseVoiceSynthesisReturn, VoiceSynthesisConfig } from '../types/voice.types';

/**
 * 语音合成Hook
 * 提供文本转语音功能
 */
export const useVoiceSynthesis = (
    config: VoiceSynthesisConfig = {
        voiceName: 'xiaoyan',
        speed: 50,
        volume: 80,
        pitch: 50
    }
): UseVoiceSynthesisReturn => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());

    /**
     * 文本转语音
     */
    const speak = useCallback(async (text: string, options?: Partial<VoiceSynthesisConfig>) => {
        try {
            setIsLoading(true);
            setError(null);

            // 合并配置
            const finalConfig = { ...config, ...options };

            // 生成语音
            const response = await voiceService.generateSpeech({
                text,
                voiceName: finalConfig.voiceName,
                speed: finalConfig.speed,
                volume: finalConfig.volume,
                pitch: finalConfig.pitch
            });

            // 播放语音
            await audioPlayerRef.current.playAudio(response.audioData);
            setIsSpeaking(true);

            // 监听播放结束
            audioPlayerRef.current.onEnded(() => {
                setIsSpeaking(false);
            });

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '语音合成失败';
            setError(errorMessage);
            setIsLoading(false);
            setIsSpeaking(false);
        }
    }, [config]);

    /**
     * 停止语音播放
     */
    const stop = useCallback(() => {
        try {
            audioPlayerRef.current.stop();
            setIsSpeaking(false);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '停止语音播放失败';
            setError(errorMessage);
            return false;
        }
    }, []);

    /**
     * 暂停语音播放
     */
    const pause = useCallback(() => {
        try {
            audioPlayerRef.current.pause();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '暂停语音播放失败';
            setError(errorMessage);
            return false;
        }
    }, []);

    /**
     * 恢复语音播放
     */
    const resume = useCallback(() => {
        try {
            audioPlayerRef.current.resume();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '恢复语音播放失败';
            setError(errorMessage);
            return false;
        }
    }, []);

    /**
     * 设置音量
     */
    const setVolume = useCallback((volume: number) => {
        try {
            audioPlayerRef.current.setVolume(volume);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '设置音量失败';
            setError(errorMessage);
            return false;
        }
    }, []);

    /**
     * 生成语音反馈
     */
    const generateFeedback = useCallback((
        type: 'success' | 'error' | 'info' | 'warning',
        message: string
    ) => {
        // 根据类型和消息生成反馈文本
        const feedbacks: Record<string, string> = {
            'success': `成功：${message}`,
            'error': `错误：${message}`,
            'info': `信息：${message}`,
            'warning': `警告：${message}`
        };

        return feedbacks[type] || message;
    }, []);

    /**
     * 播放语音反馈
     */
    const speakFeedback = useCallback(async (
        type: 'success' | 'error' | 'info' | 'warning',
        message: string
    ): Promise<void> => {
        const feedback = generateFeedback(type, message);
        await speak(feedback);
    }, [speak, generateFeedback]);

    /**
     * 预加载语音
     */
    const preload = useCallback(async (text: string, options?: Partial<VoiceSynthesisConfig>) => {
        try {
            setIsLoading(true);
            setError(null);

            const finalConfig = { ...config, ...options };

            const response = await voiceService.generateSpeech({
                text,
                voiceName: finalConfig.voiceName,
                speed: finalConfig.speed,
                volume: finalConfig.volume,
                pitch: finalConfig.pitch
            });

            // 预加载到音频播放器
            await audioPlayerRef.current.preload(response.audioData);
            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '预加载语音失败';
            setError(errorMessage);
            setIsLoading(false);
        }
    }, [config]);

    /**
     * 播放预加载的语音
     */
    const playPreloaded = useCallback(async () => {
        try {
            setIsSpeaking(true);
            setError(null);

            await audioPlayerRef.current.playPreloaded();
            setIsSpeaking(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '播放预加载语音失败';
            setError(errorMessage);
            setIsSpeaking(false);
        }
    }, []);

    /**
     * 获取当前播放状态
     */
    const getPlaybackStatus = useCallback(() => {
        return audioPlayerRef.current.getPlaybackStatus();
    }, []);

    /**
     * 获取支持的语音列表
     */
    const getAvailableVoices = useCallback(() => {
        return [
            { name: 'xiaoyan', description: '小燕 - 青年女声', language: 'zh-CN' },
            { name: 'xiaoyu', description: '小宇 - 青年男声', language: 'zh-CN' },
            { name: 'xiaomei', description: '小梅 - 甜美女声', language: 'zh-CN' },
            { name: 'xiaokun', description: '小坤 - 磁性男声', language: 'zh-CN' },
            { name: 'xiaorong', description: '小蓉 - 温柔女声', language: 'zh-CN' }
        ];
    }, []);

    /**
     * 设置语音配置
     */
    const setConfig = useCallback((newConfig: Partial<VoiceSynthesisConfig>) => {
        Object.assign(config, newConfig);
    }, [config]);

    return {
        isSpeaking,
        isLoading,
        error,
        speak,
        stop,
        pause,
        resume,
        setVolume,
        speakFeedback,
        preload,
        playPreloaded,
        getPlaybackStatus,
        getAvailableVoices,
        setConfig
    };
};

export default useVoiceSynthesis;