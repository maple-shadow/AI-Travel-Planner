import { useState, useCallback } from 'react';
import { TripPlanningRequest, TripPlan } from '../types';

/**
 * AI旅行规划Hook
 * 提供智能行程规划功能
 */
export const useAITripPlanning = () => {
    const [isPlanning, setIsPlanning] = useState(false);
    const [plan, setPlan] = useState<TripPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * 生成行程规划
     */
    const generateTripPlan = useCallback(async (request: TripPlanningRequest): Promise<TripPlan> => {
        setIsPlanning(true);
        setError(null);

        try {
            // 模拟AI规划过程 - 实际项目中这里会调用后端AI服务
            const mockPlan: TripPlan = await new Promise((resolve) => {
                setTimeout(() => {
                    const days = Math.ceil(
                        (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    const itinerary = Array.from({ length: days }, (_, index) => ({
                        day: index + 1,
                        date: new Date(request.startDate).toISOString().split('T')[0],
                        activities: [
                            {
                                time: '09:00-12:00',
                                activity: '景点游览',
                                location: `${request.destination}主要景点`,
                                estimatedCost: Math.round(request.budget / days / 3),
                                description: '参观当地著名景点'
                            },
                            {
                                time: '12:00-13:30',
                                activity: '午餐',
                                location: '当地特色餐厅',
                                estimatedCost: Math.round(request.budget / days / 6),
                                description: '品尝当地特色美食'
                            },
                            {
                                time: '14:00-17:00',
                                activity: '自由活动',
                                location: request.destination,
                                estimatedCost: Math.round(request.budget / days / 4),
                                description: '根据个人兴趣自由安排'
                            }
                        ]
                    }));

                    resolve({
                        itinerary,
                        totalEstimatedCost: Math.round(request.budget * 0.8), // 80%的预算使用
                        recommendations: [
                            '建议提前预订热门景点门票',
                            '当地交通建议使用公共交通',
                            '注意天气变化，携带雨具',
                            '保持手机电量充足，下载离线地图'
                        ],
                        weatherAdvice: getWeatherAdvice(request.startDate)
                    });
                }, 2000);
            });

            setPlan(mockPlan);
            return mockPlan;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '行程规划失败';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsPlanning(false);
        }
    }, []);

    /**
     * 优化行程规划
     */
    const optimizeTripPlan = useCallback(async (
        currentPlan: TripPlan,
        optimizationType: 'time' | 'cost' | 'experience'
    ): Promise<TripPlan> => {
        setIsPlanning(true);
        setError(null);

        try {
            // 模拟优化过程
            const optimizedPlan = await new Promise<TripPlan>((resolve) => {
                setTimeout(() => {
                    const optimized = { ...currentPlan };

                    switch (optimizationType) {
                        case 'cost':
                            optimized.totalEstimatedCost = Math.round(currentPlan.totalEstimatedCost * 0.9);
                            optimized.recommendations = [
                                '选择经济型住宿和餐饮',
                                '使用公共交通代替出租车',
                                '寻找免费或低价景点',
                                ...currentPlan.recommendations
                            ];
                            break;
                        case 'time':
                            optimized.recommendations = [
                                '合理安排行程，避免交通拥堵',
                                '选择距离较近的景点组合',
                                '提前预订快速通道门票',
                                ...currentPlan.recommendations
                            ];
                            break;
                        case 'experience':
                            optimized.recommendations = [
                                '深度体验当地文化',
                                '尝试特色活动和体验',
                                '与当地人交流互动',
                                ...currentPlan.recommendations
                            ];
                            break;
                    }

                    resolve(optimized);
                }, 1500);
            });

            setPlan(optimizedPlan);
            return optimizedPlan;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '行程优化失败';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsPlanning(false);
        }
    }, []);

    /**
     * 清除规划结果
     */
    const clearPlan = useCallback(() => {
        setPlan(null);
        setError(null);
    }, []);

    return {
        isPlanning,
        plan,
        error,
        generateTripPlan,
        optimizeTripPlan,
        clearPlan
    };
};

/**
 * 获取天气建议
 */
const getWeatherAdvice = (date: string): string => {
    const month = new Date(date).getMonth() + 1;

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
};