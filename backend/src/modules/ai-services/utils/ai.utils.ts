import { TripPlanningRequest, BudgetAnalysisRequest, AIError } from '../types/ai.types';

/**
 * AI工具函数
 */
export class AIUtils {
    /**
     * 构建行程规划提示词
     */
    static buildTripPlanningPrompt(request: TripPlanningRequest): string {
        const { destination, startDate, endDate, budget, preferences, constraints } = request;

        let prompt = `请为以下旅行需求生成详细的行程规划：\n\n`;
        prompt += `目的地：${destination}\n`;
        prompt += `旅行日期：${startDate} 至 ${endDate}\n`;
        prompt += `预算：${budget}元\n`;
        prompt += `旅行风格：${preferences.travelStyle}\n`;
        prompt += `团队人数：${preferences.groupSize}人\n`;

        if (preferences.interests.length > 0) {
            prompt += `兴趣偏好：${preferences.interests.join('、')}\n`;
        }

        if (constraints) {
            if (constraints.accessibility) {
                prompt += `特殊需求：${constraints.accessibility.join('、')}\n`;
            }
            if (constraints.dietary) {
                prompt += `饮食限制：${constraints.dietary.join('、')}\n`;
            }
            if (constraints.language) {
                prompt += `语言偏好：${constraints.language}\n`;
            }
        }

        prompt += `\n请提供：\n`;
        prompt += `1. 每日详细行程安排（时间、活动、地点、描述、预估费用）\n`;
        prompt += `2. 总费用估算\n`;
        prompt += `3. 实用建议和注意事项\n`;

        return prompt;
    }

    /**
     * 构建预算分析提示词
     */
    static buildBudgetAnalysisPrompt(request: BudgetAnalysisRequest): string {
        const { tripData, historicalExpenses, userPreferences } = request;

        let prompt = `请对以下旅行进行预算分析：\n\n`;
        prompt += `目的地：${tripData.destination}\n`;
        prompt += `旅行日期：${tripData.startDate} 至 ${tripData.endDate}\n`;
        prompt += `总预算：${tripData.budget}元\n`;
        prompt += `预算优先级：${userPreferences.budgetPriority}\n`;

        if (historicalExpenses && historicalExpenses.length > 0) {
            prompt += `历史开销记录：\n`;
            historicalExpenses.forEach(expense => {
                prompt += `- ${expense.category}: ${expense.amount}元 (${expense.date})\n`;
            });
        }

        prompt += `\n请提供：\n`;
        prompt += `1. 预算分项明细（住宿、交通、餐饮、活动等）\n`;
        prompt += `2. 省钱机会和建议\n`;
        prompt += `3. 风险评估\n`;

        return prompt;
    }

    /**
     * 解析AI响应为结构化数据
     */
    static parseAIResponse<T>(response: any, schema: Record<string, any>): T {
        try {
            // 尝试解析JSON格式的响应
            let content = response.output?.text || response.data?.result || response;

            if (typeof content === 'string') {
                // 尝试从字符串中提取JSON
                const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    content = JSON.parse(jsonMatch[0]);
                }
            }

            // 简单的验证和转换
            const result: any = {};
            for (const key in schema) {
                if (content[key] !== undefined) {
                    result[key] = content[key];
                }
            }

            return result as T;
        } catch (error) {
            const aiError: AIError = {
                code: 'RESPONSE_PARSE_ERROR',
                message: '解析AI响应失败',
                details: error
            };
            throw aiError;
        }
    }

    /**
     * 验证AI配置
     */
    static validateAIConfig(config: any): boolean {
        const requiredFields = ['aliyun', 'iflytek'];

        for (const field of requiredFields) {
            if (!config[field]) {
                return false;
            }
        }

        return true;
    }

    /**
     * 计算API调用延迟
     */
    static calculateDelay(retryCount: number): number {
        return Math.min(1000 * Math.pow(2, retryCount), 30000); // 指数退避，最大30秒
    }

    /**
     * 格式化错误信息
     */
    static formatError(error: any): AIError {
        if (error.code && error.message) {
            return error as AIError;
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || '未知错误',
            details: error
        };
    }
}

export default AIUtils;