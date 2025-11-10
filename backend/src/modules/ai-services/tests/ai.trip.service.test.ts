import { AITripService } from '../services/ai.trip.service';
import { TripPlanningRequest } from '../types/ai.types';

// Mock AI客户端
jest.mock('../clients/aliyun.client', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            generateTripPlan: jest.fn().mockResolvedValue({
                output: {
                    text: JSON.stringify({
                        itinerary: [
                            {
                                day: 1,
                                date: '2024-01-01',
                                activities: [
                                    {
                                        time: '09:00',
                                        activity: '早餐',
                                        location: '酒店',
                                        description: '享用酒店自助早餐',
                                        estimatedCost: 50
                                    }
                                ]
                            }
                        ],
                        totalEstimatedCost: 5000,
                        recommendations: ['建议提前预订门票']
                    })
                }
            }),
            checkHealth: jest.fn().mockResolvedValue(true)
        }))
    };
});

describe('AITripService', () => {
    let tripService: AITripService;
    const mockConfig = {
        accessKeyId: 'test-key',
        accessKeySecret: 'test-secret',
        endpoint: 'https://test-endpoint.com'
    };

    beforeEach(() => {
        tripService = new AITripService(mockConfig);
    });

    describe('generateTripPlan', () => {
        it('应该成功生成行程规划', async () => {
            const request: TripPlanningRequest = {
                destination: '北京',
                startDate: '2024-01-01',
                endDate: '2024-01-03',
                budget: 5000,
                preferences: {
                    interests: ['历史', '文化'],
                    travelStyle: 'cultural' as const,
                    groupSize: 2
                }
            };

            const result = await tripService.generateTripPlan(request);

            expect(result).toBeDefined();
            expect(result.itinerary).toHaveLength(1);
            expect(result.totalEstimatedCost).toBe(5000);
            expect(result.recommendations).toContain('建议提前预订门票');
        });

        it('应该处理AI服务错误', async () => {
            // Mock AI客户端抛出错误
            const mockClient = require('../clients/aliyun.client').default;
            const mockInstance = new mockClient();
            mockInstance.generateTripPlan.mockRejectedValue(new Error('API调用失败'));

            const request: TripPlanningRequest = {
                destination: '北京',
                startDate: '2024-01-01',
                endDate: '2024-01-03',
                budget: 5000,
                preferences: {
                    interests: ['历史', '文化'],
                    travelStyle: 'cultural' as const,
                    groupSize: 2
                }
            };

            await expect(tripService.generateTripPlan(request)).rejects.toThrow('API调用失败');
        });
    });

    describe('optimizeTripRoute', () => {
        it('应该成功优化行程路线', async () => {
            const itinerary = [
                {
                    day: 1,
                    date: '2024-01-01',
                    activities: [
                        {
                            time: '09:00',
                            activity: '早餐',
                            location: '酒店',
                            description: '享用酒店自助早餐',
                            estimatedCost: 50
                        }
                    ]
                }
            ];

            const result = await tripService.optimizeTripRoute(itinerary, 'time');

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('suggestTripActivities', () => {
        it('应该成功推荐行程活动', async () => {
            const result = await tripService.suggestTripActivities('北京', ['历史', '文化'], 3);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('analyzeTripPreferences', () => {
        it('应该成功分析行程偏好', async () => {
            const historicalTrips = [
                {
                    destination: '北京',
                    travelStyle: 'cultural',
                    duration: 3
                }
            ];

            const result = await tripService.analyzeTripPreferences(historicalTrips);

            expect(result).toBeDefined();
            expect(result.preferences).toBeDefined();
            expect(result.recommendations).toBeDefined();
        });
    });

    describe('checkHealth', () => {
        it('应该返回服务健康状态', async () => {
            const isHealthy = await tripService.checkHealth();

            expect(isHealthy).toBe(true);
        });
    });

    describe('getServiceStatus', () => {
        it('应该返回服务状态信息', () => {
            const status = tripService.getServiceStatus();

            expect(status).toBeDefined();
            expect(status.service).toBe('trip-planning');
            expect(['healthy', 'degraded', 'unavailable']).toContain(status.status);
        });
    });
});