import { AIServiceConfig, AIError } from '../types/ai.types';

/**
 * 阿里云AI客户端
 * 用于调用阿里云百炼AI服务
 */
export class AliyunAIClient {
    private config: AIServiceConfig['aliyun'];
    private baseURL: string;

    constructor(config: AIServiceConfig['aliyun']) {
        this.config = config;
        this.baseURL = config.endpoint || 'https://dashscope.aliyuncs.com/api/v1';
    }

    /**
     * 调用阿里云AI模型
     */
    async callModel(modelName: string, messages: any[], parameters: any = {}) {
        try {
            const response = await fetch(`${this.baseURL}/services/aigc/text-generation/generation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessKeyId}`,
                    'X-DashScope-Async': 'enable',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelName,
                    input: {
                        messages: messages
                    },
                    parameters: parameters
                })
            });

            if (!response.ok) {
                throw new Error(`阿里云API调用失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.code) {
                throw new Error(`阿里云API错误: ${data.message}`);
            }

            return data;
        } catch (error) {
            const aiError: AIError = {
                code: 'ALIYUN_API_ERROR',
                message: error instanceof Error ? error.message : '未知错误',
                details: error
            };
            throw aiError;
        }
    }

    /**
     * 生成行程规划
     */
    async generateTripPlan(prompt: string, parameters: any = {}) {
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的旅行规划师，请根据用户需求生成详细的行程规划。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return this.callModel('qwen-turbo', messages, {
            temperature: 0.7,
            max_tokens: 2000,
            ...parameters
        });
    }

    /**
     * 分析预算
     */
    async analyzeBudget(prompt: string, parameters: any = {}) {
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的财务分析师，请根据用户提供的旅行信息和预算数据进行分析和建议。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return this.callModel('qwen-turbo', messages, {
            temperature: 0.3,
            max_tokens: 1500,
            ...parameters
        });
    }

    /**
     * 检查服务状态
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/services/aigc/text-generation/models`, {
                headers: {
                    'Authorization': `Bearer ${this.config.accessKeyId}`,
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

export default AliyunAIClient;