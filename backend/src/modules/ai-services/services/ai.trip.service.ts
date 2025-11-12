import { TripPlanningRequest, TripPlanningResponse, AIError, AIServiceStatus } from '../types/ai.types';
import BailianAIClient from '../clients/bailian.client';
import AIUtils from '../utils/ai.utils';

/**
 * AI行程规划服务
 * 提供智能行程规划功能
 */
export class AITripService {
    private bailianClient: BailianAIClient;
    private serviceStatus: AIServiceStatus;

    constructor(bailianConfig: any) {
        this.bailianClient = new BailianAIClient(bailianConfig);
        this.serviceStatus = {
            service: 'trip-planning',
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 0
        };
    }

    /**
     * 生成行程规划
     */
    async generateTripPlan(request: TripPlanningRequest): Promise<TripPlanningResponse> {
        const startTime = Date.now();

        try {
            // 构建提示词
            const prompt = AIUtils.buildTripPlanningPrompt(request);

            // 调用AI服务
            const response = await this.bailianClient.generateTripPlan(prompt, {
                temperature: 0.7,
                max_tokens: 2000
            });

            // 解析响应
            const result = AIUtils.parseAIResponse<TripPlanningResponse>(response, {
                itinerary: [],
                totalEstimatedCost: 0,
                recommendations: []
            });

            // 更新服务状态
            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return this.enrichTripPlan(result, request);
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 优化行程路线
     */
    async optimizeTripRoute(itinerary: TripPlanningResponse['itinerary'], optimizationType: 'time' | 'cost' | 'experience'): Promise<TripPlanningResponse['itinerary']> {
        const startTime = Date.now();

        try {
            const prompt = `请优化以下行程路线，优化目标：${optimizationType}\n\n` +
                `当前行程：${JSON.stringify(itinerary, null, 2)}\n\n` +
                `请提供优化后的行程安排，重点考虑：\n` +
                `- ${optimizationType === 'time' ? '时间效率最大化' : ''}` +
                `- ${optimizationType === 'cost' ? '成本最小化' : ''}` +
                `- ${optimizationType === 'experience' ? '体验最优化' : ''}`;

            const response = await this.bailianClient.generateTripPlan(prompt, {
                temperature: 0.5,
                max_tokens: 1500
            });

            const result = AIUtils.parseAIResponse<{ itinerary: TripPlanningResponse['itinerary'] }>(response, {
                itinerary: []
            });

            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return result.itinerary;
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 推荐行程活动
     */
    async suggestTripActivities(destination: string, interests: string[], duration: number): Promise<string[]> {
        const startTime = Date.now();

        try {
            const prompt = `目的地：${destination}\n` +
                `兴趣偏好：${interests.join('、')}\n` +
                `旅行时长：${duration}天\n\n` +
                `请推荐适合的活动和体验，每个活动请简要描述。`;

            const response = await this.bailianClient.generateTripPlan(prompt, {
                temperature: 0.8,
                max_tokens: 1000
            });

            const result = AIUtils.parseAIResponse<{ activities: string[] }>(response, {
                activities: []
            });

            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return result.activities;
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 分析行程偏好
     */
    async analyzeTripPreferences(historicalTrips: any[]): Promise<{ preferences: string[]; recommendations: string[] }> {
        const startTime = Date.now();

        try {
            const prompt = `基于以下历史旅行记录分析用户的行程偏好：\n\n` +
                `${JSON.stringify(historicalTrips, null, 2)}\n\n` +
                `请分析用户的旅行偏好模式，并提供个性化推荐。`;

            const response = await this.bailianClient.generateTripPlan(prompt, {
                temperature: 0.6,
                max_tokens: 1200
            });

            const result = AIUtils.parseAIResponse<{
                preferences: string[];
                recommendations: string[]
            }>(response, {
                preferences: [],
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
     * 丰富行程规划数据
     */
    private enrichTripPlan(plan: TripPlanningResponse, request: TripPlanningRequest): TripPlanningResponse {
        // 添加默认的天气建议
        if (!plan.weatherAdvice) {
            plan.weatherAdvice = this.generateWeatherAdvice(request.startDate, request.endDate, request.destination);
        }

        // 确保总费用计算正确
        if (!plan.totalEstimatedCost || plan.totalEstimatedCost === 0) {
            plan.totalEstimatedCost = this.calculateTotalCost(plan.itinerary);
        }

        return plan;
    }

    /**
     * 生成天气建议
     */
    private generateWeatherAdvice(startDate: string, endDate: string, destination: string): string {
        const month = new Date(startDate).getMonth() + 1;

        const seasonalAdvice: Record<number, string> = {
            12: '冬季旅行，注意保暖，携带厚衣服',
            1: '冬季旅行，注意保暖，携带厚衣服',
            2: '冬季旅行，注意保暖，携带厚衣服',
            3: '春季旅行，天气多变，建议携带雨具',
            4: '春季旅行，天气温暖，适合户外活动',
            5: '春季旅行，天气宜人，适合各种活动',
            6: '夏季旅行，天气炎热，注意防晒',
            7: '夏季旅行，天气炎热，注意防暑',
            8: '夏季旅行，天气炎热，注意防晒',
            9: '秋季旅行，天气凉爽，适合户外活动',
            10: '秋季旅行，天气宜人，适合各种活动',
            11: '秋季旅行，天气转凉，注意保暖'
        };

        return seasonalAdvice[month] || '请根据当地天气预报准备合适的衣物和装备';
    }

    /**
     * 计算总费用
     */
    private calculateTotalCost(itinerary: TripPlanningResponse['itinerary']): number {
        return itinerary.reduce((total, day) => {
            return total + day.activities.reduce((dayTotal, activity) => {
                return dayTotal + (activity.estimatedCost || 0);
            }, 0);
        }, 0);
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
            const isHealthy = await this.bailianClient.checkHealth();
            this.serviceStatus.status = isHealthy ? 'healthy' : 'unavailable';
            return isHealthy;
        } catch {
            this.serviceStatus.status = 'unavailable';
            return false;
        }
    }
}

export default AITripService;