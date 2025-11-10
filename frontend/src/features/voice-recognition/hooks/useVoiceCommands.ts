import { useState, useCallback, useRef } from 'react';
import { VoiceCommandProcessor, VoiceIntentAnalyzer } from '../utils/voice.utils';
import { UseVoiceCommandsReturn, VoiceCommand } from '../types/voice.types';

/**
 * 语音命令Hook
 * 提供语音命令的注册、管理和执行功能
 */
export const useVoiceCommands = (): UseVoiceCommandsReturn => {
    const [commands, setCommands] = useState<VoiceCommand[]>([]);
    const commandProcessorRef = useRef<VoiceCommandProcessor>(new VoiceCommandProcessor());
    const intentAnalyzerRef = useRef<VoiceIntentAnalyzer>(new VoiceIntentAnalyzer());

    /**
     * 注册语音命令
     */
    const registerCommand = useCallback((command: Omit<VoiceCommand, 'id'>) => {
        const id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCommand: VoiceCommand = { ...command, id };

        // 注册到命令处理器
        commandProcessorRef.current.registerCommand(
            id,
            command.command,
            command.action,
            command.enabled
        );

        // 更新命令列表
        setCommands(prev => [...prev, newCommand]);
    }, []);

    /**
     * 取消注册语音命令
     */
    const unregisterCommand = useCallback((commandId: string) => {
        commandProcessorRef.current.unregisterCommand(commandId);
        setCommands(prev => prev.filter(cmd => cmd.id !== commandId));
    }, []);

    /**
     * 启用语音命令
     */
    const enableCommand = useCallback((commandId: string) => {
        commandProcessorRef.current.enableCommand(commandId);
        setCommands(prev =>
            prev.map(cmd =>
                cmd.id === commandId ? { ...cmd, enabled: true } : cmd
            )
        );
    }, []);

    /**
     * 禁用语音命令
     */
    const disableCommand = useCallback((commandId: string) => {
        commandProcessorRef.current.disableCommand(commandId);
        setCommands(prev =>
            prev.map(cmd =>
                cmd.id === commandId ? { ...cmd, enabled: false } : cmd
            )
        );
    }, []);

    /**
     * 执行语音命令
     */
    const executeCommand = useCallback((commandId: string) => {
        const command = commands.find(cmd => cmd.id === commandId);
        if (command && command.enabled) {
            try {
                command.action();
                return true;
            } catch (error) {
                console.error(`执行命令 ${commandId} 失败:`, error);
                return false;
            }
        }
        return false;
    }, [commands]);

    /**
     * 处理语音文本并执行匹配的命令
     */
    const processVoiceText = useCallback((text: string): string | null => {
        return commandProcessorRef.current.processText(text);
    }, []);

    /**
     * 分析语音意图
     */
    const analyzeIntent = useCallback((text: string) => {
        return intentAnalyzerRef.current.analyzeIntent(text);
    }, []);

    /**
     * 添加自定义意图
     */
    const addIntent = useCallback((intent: string, keywords: string[], confidence: number = 0.7) => {
        intentAnalyzerRef.current.addIntent(intent, keywords, confidence);
    }, []);

    /**
     * 移除意图
     */
    const removeIntent = useCallback((intent: string) => {
        intentAnalyzerRef.current.removeIntent(intent);
    }, []);

    /**
     * 清空所有命令
     */
    const clearCommands = useCallback(() => {
        commandProcessorRef.current.clearCommands();
        setCommands([]);
    }, []);

    /**
     * 获取所有注册的命令
     */
    const getRegisteredCommands = useCallback(() => {
        return commandProcessorRef.current.getAllCommands();
    }, []);

    return {
        commands,
        registerCommand,
        unregisterCommand,
        enableCommand,
        disableCommand,
        executeCommand,
        // 扩展方法
        processVoiceText,
        analyzeIntent,
        addIntent,
        removeIntent,
        clearCommands,
        getRegisteredCommands
    };
};

/**
 * 预定义的语音命令
 */
export const defaultVoiceCommands: Omit<VoiceCommand, 'id'>[] = [
    {
        command: '开始录音',
        description: '开始语音识别',
        action: () => {
            // 这个命令需要在具体组件中实现
            console.log('开始录音命令被触发');
        },
        enabled: true
    },
    {
        command: '停止录音',
        description: '停止语音识别',
        action: () => {
            console.log('停止录音命令被触发');
        },
        enabled: true
    },
    {
        command: '清空结果',
        description: '清空识别结果',
        action: () => {
            console.log('清空结果命令被触发');
        },
        enabled: true
    },
    {
        command: '帮助',
        description: '显示语音命令帮助',
        action: () => {
            console.log('帮助命令被触发');
        },
        enabled: true
    },
    {
        command: '计划行程',
        description: '开始行程规划',
        action: () => {
            console.log('计划行程命令被触发');
        },
        enabled: true
    },
    {
        command: '查看预算',
        description: '查看预算分析',
        action: () => {
            console.log('查看预算命令被触发');
        },
        enabled: true
    },
    {
        command: '搜索目的地',
        description: '搜索旅游目的地',
        action: () => {
            console.log('搜索目的地命令被触发');
        },
        enabled: true
    }
];

export default useVoiceCommands;