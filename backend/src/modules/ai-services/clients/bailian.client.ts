import OpenAI from "openai";
import { AIServiceConfig, AIError } from '../types/ai.types';

/**
 * 百炼AI客户端
 * 用于调用百炼AI服务，基于OpenAI兼容接口
 */
export class BailianAIClient {
    private openai: OpenAI;
    private config: AIServiceConfig['bailian'];

    constructor(config: AIServiceConfig['bailian']) {
        this.config = config;

        // 初始化OpenAI客户端，使用百炼API配置
        this.openai = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL
        });
    }

    /**
     * 调用百炼AI模型
     */
    async callModel(modelName: string, messages: any[], parameters: any = {}) {
        try {
            const response = await this.openai.chat.completions.create({
                model: modelName,
                messages,
                stream: false,
                enable_thinking: true,
                ...parameters
            });

            const choice = response.choices[0];
            if (!choice || !choice.message) {
                throw new Error('百炼API返回无效响应');
            }

            return {
                content: choice.message.content || '',
                reasoning: '', // 非流式响应中无法获取思考过程
                model: modelName
            };
        } catch (error) {
            const aiError: AIError = {
                code: 'BAILIAN_API_ERROR',
                message: error instanceof Error ? error.message : '百炼API调用失败',
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
                content: '你是一个专业的旅行规划师，请根据用户需求生成详细的行程规划。包括每日活动安排、景点推荐、餐饮建议、交通方式等。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return this.callModel('qwen-plus-2025-07-28', messages, {
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
                content: '你是一个专业的财务分析师，请根据用户提供的旅行信息和预算数据进行分析和建议。包括预算分配、节省建议、风险评估等。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return this.callModel('qwen-plus-2025-07-28', messages, {
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
            const response = await this.openai.chat.completions.create({
                model: 'qwen-plus-2025-07-28',
                messages: [{ role: 'user', content: '你好' }],
                max_tokens: 10
            });
            return !!response;
        } catch {
            return false;
        }
    }
}

export default BailianAIClient;