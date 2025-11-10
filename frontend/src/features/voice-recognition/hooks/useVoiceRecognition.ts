import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '../services/voiceService';
import { AudioRecorder, AudioConverter } from '../utils/audio.utils';
import { RecognitionResultProcessor } from '../utils/voice.utils';
import { UseVoiceRecognitionReturn, VoiceRecognitionConfig } from '../types/voice.types';

/**
 * 语音识别Hook
 * 提供语音识别功能的状态管理和方法
 */
export const useVoiceRecognition = (
    config: VoiceRecognitionConfig = {
        language: 'zh-CN',
        continuous: false,
        interimResults: false,
        maxAlternatives: 1,
        audioFormat: 'wav'
    }
): UseVoiceRecognitionReturn => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognitionResult, setRecognitionResult] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const audioRecorderRef = useRef<AudioRecorder | null>(null);
    const volumeIntervalRef = useRef<number | null>(null);

    /**
     * 初始化音频录制器
     */
    const initializeRecorder = useCallback(async () => {
        try {
            if (!audioRecorderRef.current) {
                audioRecorderRef.current = new AudioRecorder();
                await audioRecorderRef.current.initialize();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '初始化音频录制器失败';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    /**
     * 开始语音监听
     */
    const startListening = useCallback(async () => {
        try {
            setError(null);
            setIsProcessing(true);

            await initializeRecorder();

            if (!audioRecorderRef.current) {
                throw new Error('音频录制器未初始化');
            }

            // 开始录制
            audioRecorderRef.current.startRecording();
            setIsListening(true);
            setIsProcessing(false);

            // 开始音量监控
            volumeIntervalRef.current = window.setInterval(() => {
                if (audioRecorderRef.current) {
                    const level = audioRecorderRef.current.getVolumeLevel();
                    setAudioLevel(level);
                }
            }, 100);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '开始语音监听失败';
            setError(errorMessage);
            setIsProcessing(false);
            setIsListening(false);
        }
    }, [initializeRecorder]);

    /**
     * 停止语音监听
     */
    const stopListening = useCallback(async () => {
        try {
            if (!audioRecorderRef.current) {
                return;
            }

            setIsProcessing(true);

            // 停止音量监控
            if (volumeIntervalRef.current) {
                window.clearInterval(volumeIntervalRef.current);
                volumeIntervalRef.current = null;
            }

            // 停止录制并获取音频数据
            const audioBlob = await audioRecorderRef.current.stopRecording();
            setIsListening(false);

            // 处理音频数据
            const base64Audio = await AudioConverter.blobToBase64(audioBlob);

            // 发送到语音识别服务
            const response = await voiceService.transcribeSpeech({
                audioData: base64Audio,
                audioFormat: config.audioFormat,
                language: config.language
            });

            // 处理识别结果
            const cleanedResult = RecognitionResultProcessor.cleanResult(response.text);
            const resultConfidence = RecognitionResultProcessor.calculateConfidence(cleanedResult);

            setRecognitionResult(cleanedResult);
            setConfidence(resultConfidence);
            setIsProcessing(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '语音识别失败';
            setError(errorMessage);
            setIsProcessing(false);
        }
    }, [config.audioFormat, config.language]);

    /**
     * 清除识别结果
     */
    const clearResult = useCallback(() => {
        setRecognitionResult('');
        setConfidence(0);
        setError(null);
        setAudioLevel(0);
    }, []);

    /**
     * 清理资源
     */
    const cleanup = useCallback(() => {
        if (volumeIntervalRef.current) {
            window.clearInterval(volumeIntervalRef.current);
            volumeIntervalRef.current = null;
        }

        if (audioRecorderRef.current) {
            audioRecorderRef.current.cleanup();
            audioRecorderRef.current = null;
        }

        setIsListening(false);
        setIsProcessing(false);
        setAudioLevel(0);
    }, []);

    // 组件卸载时清理资源
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    /**
     * 处理连续模式
     */
    useEffect(() => {
        if (config.continuous && recognitionResult && !isProcessing) {
            // 在连续模式下，识别完成后自动重新开始监听
            const timer = setTimeout(() => {
                if (!isListening && !isProcessing) {
                    startListening();
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [config.continuous, recognitionResult, isListening, isProcessing, startListening]);

    return {
        isListening,
        recognitionResult,
        confidence,
        error,
        audioLevel,
        startListening,
        stopListening,
        clearResult
    };
};

export default useVoiceRecognition;