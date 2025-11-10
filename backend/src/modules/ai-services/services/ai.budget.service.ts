import { BudgetAnalysisRequest, BudgetAnalysisResponse, AIError, AIServiceStatus } from '../types/ai.types';
import AliyunAIClient from '../clients/aliyun.client';
import AIUtils from '../utils/ai.utils';

/**
 * AI预算分析服务
 * 提供智能预算分析和优化建议
 */
export class AIBudgetService {
    private aliyunClient: AliyunAIClient;
    private serviceStatus: AIServiceStatus;

    constructor(aliyunConfig: any) {
        this.aliyunClient = new AliyunAIClient(aliyunConfig);
        this.serviceStatus = {
            service: 'budget-analysis',
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 0
        };
    }

    /**
     * 分析预算模式
     */
    async analyzeBudgetPatterns(request: BudgetAnalysisRequest): Promise<BudgetAnalysisResponse> {
        const startTime = Date.now();

        try {
            // 构建提示词
            const prompt = AIUtils.buildBudgetAnalysisPrompt(request);

            // 调用AI服务
            const response = await this.aliyunClient.analyzeBudget(prompt, {
                temperature: 0.3,
                max_tokens: 1500
            });

            // 解析响应
            const result = AIUtils.parseAIResponse<BudgetAnalysisResponse>(response, {
                budgetBreakdown: [],
                totalBudget: 0,
                savingsOpportunities: [],
                riskAssessment: { level: 'low', reasons: [] }
            });

            // 更新服务状态
            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return this.enrichBudgetAnalysis(result, request);
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 预测开销趋势
     */
    async predictExpenseTrends(
        historicalData: { date: string; amount: number; category: string }[],
        futurePeriod: number // 预测天数
    ): Promise<{ predictions: { date: string; amount: number; category: string }[]; confidence: number }> {
        const startTime = Date.now();

        try {
            const prompt = `基于以下历史开销数据预测未来${futurePeriod}天的开销趋势：\n\n` +
                `历史数据：${JSON.stringify(historicalData, null, 2)}\n\n` +
                `请提供：\n` +
                `1. 未来${futurePeriod}天的每日开销预测\n` +
                `2. 预测的置信度\n` +
                `3. 主要开销类别分析`;

            const response = await this.aliyunClient.analyzeBudget(prompt, {
                temperature: 0.2,
                max_tokens: 1200
            });

            const result = AIUtils.parseAIResponse<{
                predictions: { date: string; amount: number; category: string }[];
                confidence: number;
            }>(response, {
                predictions: [],
                confidence: 0
            });

            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return result;
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 建议预算优化
     */
    async suggestBudgetOptimization(
        currentBudget: BudgetAnalysisResponse,
        optimizationGoal: 'savings' | 'comfort' | 'luxury'
    ): Promise<{ optimizedBudget: BudgetAnalysisResponse; savings: number; recommendations: string[] }> {
        const startTime = Date.now();

        try {
            const prompt = `当前预算分析：${JSON.stringify(currentBudget, null, 2)}\n\n` +
                `优化目标：${optimizationGoal === 'savings' ? '最大化节省' : optimizationGoal === 'comfort' ? '平衡舒适度' : '最大化舒适度'}\n\n` +
                `请提供优化后的预算方案，包括：\n` +
                `1. 优化后的预算分项\n` +
                `2. 预计节省金额\n` +
                `3. 具体的优化建议`;

            const response = await this.aliyunClient.analyzeBudget(prompt, {
                temperature: 0.4,
                max_tokens: 1300
            });

            const result = AIUtils.parseAIResponse<{
                optimizedBudget: BudgetAnalysisResponse;
                savings: number;
                recommendations: string[];
            }>(response, {
                optimizedBudget: currentBudget,
                savings: 0,
                recommendations: []
            });

            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return result;
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 生成预算建议
     */
    async generateBudgetRecommendations(
        userProfile: {
            income: number;
            savings: number;
            financialGoals: string[];
            riskTolerance: 'low' | 'medium' | 'high';
        },
        tripBudget: number
    ): Promise<{ recommendations: string[]; idealBudget: number; riskLevel: string }> {
        const startTime = Date.now();

        try {
            const prompt = `用户财务状况：\n` +
                `- 月收入：${userProfile.income}元\n` +
                `- 储蓄：${userProfile.savings}元\n` +
                `- 财务目标：${userProfile.financialGoals.join('、')}\n` +
                `- 风险承受能力：${userProfile.riskTolerance}\n\n` +
                `旅行预算：${tripBudget}元\n\n` +
                `请提供预算建议，包括：\n` +
                `1. 理想的旅行预算范围\n` +
                `2. 风险评估\n` +
                `3. 具体的预算管理建议`;

            const response = await this.aliyunClient.analyzeBudget(prompt, {
                temperature: 0.3,
                max_tokens: 1100
            });

            const result = AIUtils.parseAIResponse<{
                recommendations: string[];
                idealBudget: number;
                riskLevel: string;
            }>(response, {
                recommendations: [],
                idealBudget: tripBudget,
                riskLevel: '中等'
            });

            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return result;
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 丰富预算分析数据
     */
    private enrichBudgetAnalysis(analysis: BudgetAnalysisResponse, request: BudgetAnalysisRequest): BudgetAnalysisResponse {
        // 确保总预算设置正确
        if (!analysis.totalBudget || analysis.totalBudget === 0) {
            analysis.totalBudget = request.tripData.budget;
        }

        // 计算预算分项百分比
        if (analysis.budgetBreakdown.length > 0) {
            const total = analysis.budgetBreakdown.reduce((sum, item) => sum + item.estimatedAmount, 0);
            analysis.budgetBreakdown = analysis.budgetBreakdown.map(item => ({
                ...item,
                percentage: Math.round((item.estimatedAmount / total) * 100)
            }));
        }

        // 添加默认的省钱机会
        if (analysis.savingsOpportunities.length === 0) {
            analysis.savingsOpportunities = this.generateDefaultSavingsOpportunities(request);
        }

        return analysis;
    }

    /**
     * 生成默认省钱机会
     */
    private generateDefaultSavingsOpportunities(request: BudgetAnalysisRequest): string[] {
        const opportunities: string[] = [];

        // 基于旅行风格的建议
        const { budgetPriority } = request.userPreferences;

        if (budgetPriority === 'saving') {
            opportunities.push('考虑选择经济型住宿，可节省30-50%的住宿费用');
            opportunities.push('使用公共交通代替出租车，可节省交通费用');
            opportunities.push('选择当地特色小吃，体验地道美食同时节省餐饮费用');
        } else if (budgetPriority === 'comfort') {
            opportunities.push('提前预订住宿和交通，享受早鸟优惠');
            opportunities.push('选择套餐服务，可能获得更好的价格');
            opportunities.push('避开旅游高峰期，享受更优惠的价格');
        } else {
            opportunities.push('考虑高端套餐服务，获得更好的体验');
            opportunities.push('选择特色体验活动，提升旅行品质');
        }

        return opportunities;
    }

    /**
     * 更新服务状态
     */
    private updateServiceStatus(responseTime: number, status: AIServiceStatus['status']): void {
        this.serviceStatus = {
            ...this.serviceStatus,
            status,
            lastCheck: new Date(),
            responseTime
        };
    }

    /**
     * 获取服务状态
     */
    getServiceStatus(): AIServiceStatus {
        return this.serviceStatus;
    }

    /**
     * 检查服务健康状态
     */
    async checkHealth(): Promise<boolean> {
        try {
            const isHealthy = await this.aliyunClient.checkHealth();
            this.serviceStatus.status = isHealthy ? 'healthy' : 'unavailable';
            return isHealthy;
        } catch {
            this.serviceStatus.status = 'unavailable';
            return false;
        }
    }
}

export default AIBudgetService;