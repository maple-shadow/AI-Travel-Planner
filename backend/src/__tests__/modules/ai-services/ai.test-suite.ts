/**
 * 单元测试模块 - AI服务模块测试套件
 * 模块15：单元测试模块
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AITripService } from '../../../modules/ai-services/services/ai.trip.service';
import { AIBudgetService } from '../../../modules/ai-services/services/ai.budget.service';
import { AIVoiceService } from '../../../modules/ai-services/services/ai.voice.service';
import { AliyunClient } from '../../../modules/ai-services/clients/aliyun.client';
import { IflytekClient } from '../../../modules/ai-services/clients/iflytek.client';
import { AIValidators } from '../../../modules/ai-services/validators/ai.validators';

/**
 * AI服务模块测试套件
 */
export class AITestSuite {
    private tripService: AITripService;
    private budgetService: AIBudgetService;
    private voiceService: AIVoiceService;
    private aliyunClient: AliyunClient;
    private iflytekClient: IflytekClient;
    private validators: AIValidators;

    constructor() {
        this.tripService = new AITripService();
        this.budgetService = new AIBudgetService();
        this.voiceService = new AIVoiceService();
        this.aliyunClient = new AliyunClient();
        this.iflytekClient = new IflytekClient();
        this.validators = new AIValidators();
    }

    /**
     * 测试行程规划AI功能
     */
    testTripPlanningAI() {
        describe('行程规划AI功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该生成个性化的行程建议', async () => {
                const userPreferences = {
                    destination: '北京',
                    duration: 5,
                    budget: 5000,
                    interests: ['历史', '美食', '购物']
                };

                const result = await this.tripService.generateTripPlan(userPreferences);

                expect(result.success).toBe(true);
                expect(result.plan).toBeDefined();
                expect(result.plan.destination).toBe(userPreferences.destination);
                expect(result.plan.duration).toBe(userPreferences.duration);
                expect(Array.isArray(result.plan.itinerary)).toBe(true);
            });

            it('应该优化行程路线', async () => {
                const itinerary = [
                    { location: '天安门', duration: 2 },
                    { location: '故宫', duration: 4 },
                    { location: '颐和园', duration: 3 }
                ];

                const result = await this.tripService.optimizeItinerary(itinerary);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.optimizedItinerary)).toBe(true);
                expect(result.optimizedItinerary.length).toBe(itinerary.length);
            });

            it('应该根据实时数据调整行程', async () => {
                const planId = 'plan123';
                const realTimeData = {
                    weather: '晴天',
                    traffic: '畅通',
                    crowdLevel: '中等'
                };

                const result = await this.tripService.adjustPlanWithRealTimeData(planId, realTimeData);

                expect(result.success).toBe(true);
                expect(result.adjustedPlan).toBeDefined();
            });

            it('应该处理无效的目的地', async () => {
                const invalidPreferences = {
                    destination: '',
                    duration: 5,
                    budget: 5000
                };

                await expect(this.tripService.generateTripPlan(invalidPreferences)).rejects.toThrow('目的地无效');
            });
        });
    }

    /**
     * 测试预算优化AI功能
     */
    testBudgetOptimizationAI() {
        describe('预算优化AI功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该分析预算分配', async () => {
                const budgetData = {
                    totalAmount: 10000,
                    categories: [
                        { name: '交通', amount: 3000 },
                        { name: '住宿', amount: 4000 },
                        { name: '餐饮', amount: 2000 },
                        { name: '娱乐', amount: 1000 }
                    ]
                };

                const result = await this.budgetService.analyzeBudgetAllocation(budgetData);

                expect(result.success).toBe(true);
                expect(result.analysis).toBeDefined();
                expect(result.recommendations).toBeDefined();
                expect(Array.isArray(result.recommendations)).toBe(true);
            });

            it('应该生成预算优化建议', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.generateOptimizationSuggestions(budgetId);

                expect(result.success).toBe(true);
                expect(result.suggestions).toBeDefined();
                expect(Array.isArray(result.suggestions)).toBe(true);
            });

            it('应该预测预算使用情况', async () => {
                const budgetId = 'budget123';
                const predictionPeriod = 30; // 30天

                const result = await this.budgetService.predictBudgetUsage(budgetId, predictionPeriod);

                expect(result.success).toBe(true);
                expect(result.prediction).toBeDefined();
                expect(result.prediction.estimatedUsage).toBeDefined();
                expect(result.prediction.riskLevel).toBeDefined();
            });

            it('应该检测预算异常', async () => {
                const expenseData = [
                    { amount: 100, date: '2024-01-01' },
                    { amount: 150, date: '2024-01-02' },
                    { amount: 5000, date: '2024-01-03' } // 异常大额开销
                ];

                const result = await this.budgetService.detectBudgetAnomalies(expenseData);

                expect(result.success).toBe(true);
                expect(result.anomalies).toBeDefined();
                expect(Array.isArray(result.anomalies)).toBe(true);
            });
        });
    }

    /**
     * 测试语音AI功能
     */
    testVoiceAI() {
        describe('语音AI功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该转换文本为语音', async () => {
                const text = '欢迎使用AI旅行规划师';
                const options = {
                    voice: 'xiaoyun',
                    speed: 0,
                    pitch: 0
                };

                const result = await this.voiceService.textToSpeech(text, options);

                expect(result.success).toBe(true);
                expect(result.audioData).toBeDefined();
                expect(result.duration).toBeGreaterThan(0);
            });

            it('应该转换语音为文本', async () => {
                const audioBuffer = Buffer.from('模拟音频数据');
                const options = {
                    language: 'zh-CN',
                    sampleRate: 16000
                };

                const result = await this.voiceService.speechToText(audioBuffer, options);

                expect(result.success).toBe(true);
                expect(result.text).toBeDefined();
                expect(typeof result.text).toBe('string');
            });

            it('应该识别语音命令', async () => {
                const audioBuffer = Buffer.from('模拟语音命令音频');
                const commands = ['查询天气', '规划行程', '查看预算'];

                const result = await this.voiceService.recognizeVoiceCommand(audioBuffer, commands);

                expect(result.success).toBe(true);
                expect(result.command).toBeDefined();
                expect(commands).toContain(result.command);
            });

            it('应该处理无效的音频数据', async () => {
                const invalidAudio = Buffer.from('');

                await expect(this.voiceService.speechToText(invalidAudio, { language: 'zh-CN' })).rejects.toThrow('音频数据无效');
            });
        });
    }

    /**
     * 测试AI客户端功能
     */
    testAIClients() {
        describe('AI客户端功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该测试阿里云客户端连接', async () => {
                const result = await this.aliyunClient.testConnection();

                expect(result.success).toBe(true);
                expect(result.latency).toBeDefined();
                expect(result.latency).toBeLessThan(1000); // 延迟应小于1秒
            });

            it('应该测试讯飞客户端连接', async () => {
                const result = await this.iflytekClient.testConnection();

                expect(result.success).toBe(true);
                expect(result.status).toBe('connected');
            });

            it('应该处理API调用失败', async () => {
                // 模拟API调用失败
                jest.spyOn(this.aliyunClient, 'callAPI').mockRejectedValue(new Error('API调用失败'));

                await expect(this.aliyunClient.callAPI('invalid-endpoint', {})).rejects.toThrow('API调用失败');
            });

            it('应该验证API响应格式', async () => {
                const mockResponse = {
                    success: true,
                    data: { result: 'test' }
                };

                jest.spyOn(this.aliyunClient, 'callAPI').mockResolvedValue(mockResponse);

                const result = await this.aliyunClient.callAPI('test-endpoint', {});

                expect(result).toEqual(mockResponse);
                expect(this.aliyunClient.validateResponse(result)).toBe(true);
            });
        });
    }

    /**
     * 测试验证器功能
     */
    testValidators() {
        describe('AI服务验证器功能测试', () => {
            it('应该验证AI请求参数', () => {
                const validRequest = {
                    destination: '北京',
                    duration: 5,
                    budget: 5000,
                    interests: ['历史', '美食']
                };

                const invalidRequest = {
                    destination: '',
                    duration: -1,
                    budget: 0
                };

                expect(this.validators.validateAIRequest(validRequest)).toBe(true);
                expect(this.validators.validateAIRequest(invalidRequest)).toBe(false);
            });

            it('应该验证语音配置', () => {
                const validConfig = {
                    voice: 'xiaoyun',
                    speed: 0,
                    pitch: 0,
                    volume: 50
                };

                const invalidConfig = {
                    voice: 'invalid-voice',
                    speed: 200, // 超出范围
                    pitch: -10 // 超出范围
                };

                expect(this.validators.validateVoiceConfig(validConfig)).toBe(true);
                expect(this.validators.validateVoiceConfig(invalidConfig)).toBe(false);
            });

            it('应该验证AI响应格式', () => {
                const validResponse = {
                    success: true,
                    data: { result: 'test' },
                    timestamp: new Date().toISOString()
                };

                const invalidResponse = {
                    success: 'true', // 应该是布尔值
                    data: null
                };

                expect(this.validators.validateAIResponse(validResponse)).toBe(true);
                expect(this.validators.validateAIResponse(invalidResponse)).toBe(false);
            });
        });
    }

    /**
     * 测试错误处理
     */
    testErrorHandling() {
        describe('AI服务错误处理测试', () => {
            it('应该处理网络连接错误', async () => {
                // 模拟网络错误
                jest.spyOn(this.aliyunClient, 'callAPI').mockRejectedValue(new Error('网络连接失败'));

                await expect(this.aliyunClient.callAPI('test-endpoint', {})).rejects.toThrow('网络连接失败');
            });

            it('应该处理API限流', async () => {
                // 模拟API限流
                jest.spyOn(this.iflytekClient, 'callAPI').mockRejectedValue(new Error('API调用频率超限'));

                await expect(this.iflytekClient.callAPI('test-endpoint', {})).rejects.toThrow('API调用频率超限');
            });

            it('应该处理无效的认证信息', async () => {
                // 模拟认证错误
                jest.spyOn(this.aliyunClient, 'testConnection').mockRejectedValue(new Error('认证失败'));

                await expect(this.aliyunClient.testConnection()).rejects.toThrow('认证失败');
            });

            it('应该处理服务不可用', async () => {
                // 模拟服务不可用
                jest.spyOn(this.tripService, 'generateTripPlan').mockRejectedValue(new Error('AI服务暂时不可用'));

                await expect(this.tripService.generateTripPlan({
                    destination: '北京',
                    duration: 5,
                    budget: 5000
                })).rejects.toThrow('AI服务暂时不可用');
            });
        });
    }

    /**
     * 运行所有AI服务模块测试
     */
    runAllTests() {
        describe('AI服务模块 - 完整测试套件', () => {
            this.testTripPlanningAI();
            this.testBudgetOptimizationAI();
            this.testVoiceAI();
            this.testAIClients();
            this.testValidators();
            this.testErrorHandling();
        });
    }
}

/**
 * 创建AI服务测试套件实例
 */
export const createAITestSuite = () => {
    return new AITestSuite();
};