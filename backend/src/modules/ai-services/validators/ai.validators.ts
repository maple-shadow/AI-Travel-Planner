import { Request, Response, NextFunction } from 'express';
import { TripPlanningRequest, BudgetAnalysisRequest, VoiceRecognitionRequest } from '../types/ai.types';

/**
 * AI服务请求验证器
 * 验证AI服务API请求的合法性
 */
export class AIValidators {
    /**
     * 验证行程规划请求
     */
    static validateTripPlanningRequest(req: Request, res: Response, next: NextFunction): void {
        const { destination, startDate, endDate, budget, preferences } = req.body as TripPlanningRequest;

        const errors: string[] = [];

        // 验证必填字段
        if (!destination) errors.push('目的地(destination)是必填字段');
        if (!startDate) errors.push('开始日期(startDate)是必填字段');
        if (!endDate) errors.push('结束日期(endDate)是必填字段');

        // 验证日期格式
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime())) errors.push('开始日期格式无效');
            if (isNaN(end.getTime())) errors.push('结束日期格式无效');
            if (start >= end) errors.push('开始日期必须早于结束日期');
        }

        // 验证预算
        if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
            errors.push('预算(budget)必须是正数');
        }

        // 验证偏好设置
        if (preferences) {
            if (!preferences.travelStyle || !['adventure', 'relaxation', 'cultural', 'food'].includes(preferences.travelStyle)) {
                errors.push('旅行风格必须是 adventure, relaxation, cultural, food 之一');
            }

            if (!preferences.groupSize || preferences.groupSize < 1) {
                errors.push('团队人数必须大于0');
            }
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '请求参数验证失败',
                    details: errors
                }
            });
            return;
        }

        next();
    }

    /**
     * 验证预算分析请求
     */
    static validateBudgetAnalysisRequest(req: Request, res: Response, next: NextFunction): void {
        const { tripData, historicalExpenses, userPreferences } = req.body as BudgetAnalysisRequest;

        const errors: string[] = [];

        // 验证行程数据
        if (!tripData) {
            errors.push('行程数据(tripData)是必填字段');
        } else {
            // 复用行程规划验证
            const mockReq = { body: tripData } as Request;
            const mockRes = {
                status: () => ({ json: () => { } })
            } as unknown as Response;

            try {
                AIValidators.validateTripPlanningRequest(mockReq, mockRes, () => { });
            } catch (error) {
                errors.push('行程数据验证失败');
            }
        }

        // 验证历史开销数据
        if (historicalExpenses && Array.isArray(historicalExpenses)) {
            for (const expense of historicalExpenses) {
                if (!expense.category || typeof expense.category !== 'string') {
                    errors.push('历史开销记录中的类别(category)必须是字符串');
                }
                if (!expense.amount || typeof expense.amount !== 'number' || expense.amount < 0) {
                    errors.push('历史开销记录中的金额(amount)必须是正数');
                }
                if (!expense.date || isNaN(new Date(expense.date).getTime())) {
                    errors.push('历史开销记录中的日期(date)格式无效');
                }
            }
        }

        // 验证用户偏好
        if (userPreferences) {
            if (!userPreferences.budgetPriority || !['saving', 'comfort', 'luxury'].includes(userPreferences.budgetPriority)) {
                errors.push('预算优先级必须是 saving, comfort, luxury 之一');
            }

            if (userPreferences.spendingCategories && !Array.isArray(userPreferences.spendingCategories)) {
                errors.push('开销类别必须是数组');
            }
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '请求参数验证失败',
                    details: errors
                }
            });
            return;
        }

        next();
    }

    /**
     * 验证语音识别请求
     */
    static validateVoiceRecognitionRequest(req: Request, res: Response, next: NextFunction): void {
        const { audioData, audioFormat, language } = req.body as VoiceRecognitionRequest;

        const errors: string[] = [];

        // 验证音频数据
        if (!audioData) {
            errors.push('音频数据(audioData)是必填字段');
        } else {
            // 验证base64格式
            try {
                Buffer.from(String(audioData), 'base64');
            } catch {
                errors.push('音频数据必须是有效的base64编码');
            }
        }

        // 验证音频格式
        if (audioFormat && !['wav', 'mp3', 'ogg'].includes(audioFormat)) {
            errors.push('音频格式必须是 wav, mp3, ogg 之一');
        }

        // 验证语言
        if (language && !['zh_cn', 'en_us'].includes(language)) {
            errors.push('语言必须是 zh_cn, en_us 之一');
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '请求参数验证失败',
                    details: errors
                }
            });
            return;
        }

        next();
    }

    /**
     * 验证文本转语音请求
     */
    static validateTextToSpeechRequest(req: Request, res: Response, next: NextFunction): void {
        const { text, voice } = req.body;

        const errors: string[] = [];

        // 验证文本
        if (!text || typeof text !== 'string') {
            errors.push('文本(text)是必填字段且必须是字符串');
        } else if (text.length > 1000) {
            errors.push('文本长度不能超过1000个字符');
        }

        // 验证语音类型
        if (voice && !['xiaoyan', 'xiaoyu', 'xiaofeng', 'xiaowei'].includes(voice)) {
            errors.push('语音类型必须是 xiaoyan, xiaoyu, xiaofeng, xiaowei 之一');
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '请求参数验证失败',
                    details: errors
                }
            });
            return;
        }

        next();
    }

    /**
     * 验证语音意图分析请求
     */
    static validateVoiceIntentRequest(req: Request, res: Response, next: NextFunction): void {
        const { audioData, context } = req.body;

        const errors: string[] = [];

        // 验证音频数据
        if (!audioData) {
            errors.push('音频数据(audioData)是必填字段');
        } else {
            try {
                Buffer.from(String(audioData), 'base64');
            } catch {
                errors.push('音频数据必须是有效的base64编码');
            }
        }

        // 验证上下文
        if (context && typeof context !== 'string') {
            errors.push('上下文(context)必须是字符串');
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '请求参数验证失败',
                    details: errors
                }
            });
            return;
        }

        next();
    }
}

export default AIValidators;