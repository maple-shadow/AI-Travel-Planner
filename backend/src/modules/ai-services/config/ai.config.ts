import { AIServiceConfig, ModelConfig } from '../types/ai.types';

/**
 * AI服务配置
 * 从环境变量加载AI服务配置
 */
export const aiServiceConfig: AIServiceConfig = {
    aliyun: {
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
        endpoint: process.env.ALIYUN_AI_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1'
    },
    iflytek: {
        appId: process.env.IFLYTEK_APP_ID || '',
        apiKey: process.env.IFLYTEK_API_KEY || '',
        apiSecret: process.env.IFLYTEK_API_SECRET || ''
    },
    rateLimit: {
        requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '60'),
        requestsPerHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '1000')
    }
};

/**
 * AI模型配置
 */
export const modelConfig: ModelConfig = {
    tripPlanning: {
        modelName: process.env.AI_TRIP_MODEL || 'qwen-turbo',
        temperature: parseFloat(process.env.AI_TRIP_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_TRIP_MAX_TOKENS || '2000')
    },
    budgetAnalysis: {
        modelName: process.env.AI_BUDGET_MODEL || 'qwen-turbo',
        temperature: parseFloat(process.env.AI_BUDGET_TEMPERATURE || '0.3'),
        maxTokens: parseInt(process.env.AI_BUDGET_MAX_TOKENS || '1500')
    },
    voiceRecognition: {
        modelName: process.env.AI_VOICE_MODEL || 'iflytek-speech',
        sampleRate: parseInt(process.env.AI_VOICE_SAMPLE_RATE || '16000'),
        format: process.env.AI_VOICE_FORMAT || 'wav'
    }
};

/**
 * 验证AI配置是否完整
 */
export const validateAIConfig = (): boolean => {
    const requiredEnvVars = [
        'ALIYUN_ACCESS_KEY_ID',
        'ALIYUN_ACCESS_KEY_SECRET',
        'IFLYTEK_APP_ID',
        'IFLYTEK_API_KEY',
        'IFLYTEK_API_SECRET'
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.warn(`警告: 缺少AI服务环境变量 ${envVar}`);
            return false;
        }
    }

    return true;
};

/**
 * 获取完整的AI配置
 */
export const getAIConfig = () => ({
    ...aiServiceConfig,
    models: modelConfig
});

export default {
    aiServiceConfig,
    modelConfig,
    validateAIConfig,
    getAIConfig
};