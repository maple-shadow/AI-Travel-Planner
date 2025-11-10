/**
 * 单元测试模块 - 行程管理模块测试套件
 * 模块15：单元测试模块
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TripService } from '../../../modules/trips/services/trip.service';
import { TripController } from '../../../modules/trips/controllers/trip.controller';
import { TripValidator } from '../../../modules/trips/validators/trip.validator';

/**
 * 行程管理模块测试套件
 */
export class TripTestSuite {
    private tripService: TripService;
    private tripController: TripController;
    private tripValidator: TripValidator;

    constructor() {
        this.tripService = new TripService();
        this.tripController = new TripController();
        this.tripValidator = new TripValidator();
    }

    /**
     * 测试行程创建功能
     */
    testTripCreation() {
        describe('行程创建功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功创建行程', async () => {
                const tripData = {
                    title: '北京三日游',
                    destination: '北京',
                    startDate: new Date('2024-06-01'),
                    endDate: new Date('2024-06-03'),
                    description: '探索北京的历史文化',
                    budget: 5000,
                    participants: 2
                };

                const result = await this.tripService.createTrip(tripData);

                expect(result.success).toBe(true);
                expect(result.trip.id).toBeDefined();
                expect(result.trip.title).toBe('北京三日游');
                expect(result.trip.status).toBe('PLANNING');
            });

            it('应该验证行程数据格式', async () => {
                const invalidTripData = {
                    title: '', // 空标题
                    destination: '北京',
                    startDate: new Date('2024-06-03'),
                    endDate: new Date('2024-06-01'), // 结束日期早于开始日期
                    budget: -1000 // 负预算
                };

                const validation = this.tripValidator.validateTripData(invalidTripData);

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('标题不能为空');
                expect(validation.errors).toContain('结束日期必须晚于开始日期');
                expect(validation.errors).toContain('预算必须大于0');
            });

            it('应该处理重复行程创建', async () => {
                const tripData = {
                    title: '北京三日游',
                    destination: '北京',
                    startDate: new Date('2024-06-01'),
                    endDate: new Date('2024-06-03')
                };

                // 第一次创建
                await this.tripService.createTrip(tripData);

                // 尝试创建相同行程
                const result = await this.tripService.createTrip(tripData);

                expect(result.success).toBe(false);
                expect(result.error).toContain('相同行程已存在');
            });

            it('应该设置默认行程状态', async () => {
                const tripData = {
                    title: '上海周末游',
                    destination: '上海',
                    startDate: new Date('2024-07-01'),
                    endDate: new Date('2024-07-02')
                };

                const result = await this.tripService.createTrip(tripData);

                expect(result.trip.status).toBe('PLANNING');
                expect(result.trip.createdAt).toBeDefined();
                expect(result.trip.updatedAt).toBeDefined();
            });
        });
    }

    /**
     * 测试行程查询功能
     */
    testTripQuery() {
        describe('行程查询功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该根据ID查询行程', async () => {
                const tripId = 'trip123';

                const result = await this.tripService.getTripById(tripId);

                expect(result.success).toBe(true);
                expect(result.trip.id).toBe(tripId);
                expect(result.trip.title).toBeDefined();
                expect(result.trip.destination).toBeDefined();
            });

            it('应该查询用户行程列表', async () => {
                const userId = 'user123';
                const filters = {
                    status: 'PLANNING',
                    destination: '北京'
                };

                const result = await this.tripService.getUserTrips(userId, filters);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.trips)).toBe(true);
                result.trips.forEach(trip => {
                    expect(trip.userId).toBe(userId);
                    if (filters.status) {
                        expect(trip.status).toBe(filters.status);
                    }
                    if (filters.destination) {
                        expect(trip.destination).toContain(filters.destination);
                    }
                });
            });

            it('应该支持分页查询', async () => {
                const pagination = {
                    page: 1,
                    limit: 10,
                    sortBy: 'createdAt',
                    sortOrder: 'DESC'
                };

                const result = await this.tripService.getTripsWithPagination(pagination);

                expect(result.success).toBe(true);
                expect(result.trips.length).toBeLessThanOrEqual(pagination.limit);
                expect(result.pagination.total).toBeGreaterThanOrEqual(0);
                expect(result.pagination.page).toBe(pagination.page);
                expect(result.pagination.totalPages).toBeDefined();
            });

            it('应该搜索行程', async () => {
                const searchQuery = '北京';

                const result = await this.tripService.searchTrips(searchQuery);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.trips)).toBe(true);
                result.trips.forEach(trip => {
                    expect(
                        trip.title.includes(searchQuery) ||
                        trip.destination.includes(searchQuery) ||
                        trip.description.includes(searchQuery)
                    ).toBe(true);
                });
            });

            it('应该处理不存在的行程查询', async () => {
                const nonExistentTripId = 'non-existent-id';

                const result = await this.tripService.getTripById(nonExistentTripId);

                expect(result.success).toBe(false);
                expect(result.error).toContain('行程不存在');
            });
        });
    }

    /**
     * 测试行程更新功能
     */
    testTripUpdate() {
        describe('行程更新功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功更新行程信息', async () => {
                const tripId = 'trip123';
                const updateData = {
                    title: '北京三日游（更新）',
                    description: '探索北京的历史文化，包括故宫和长城',
                    budget: 6000
                };

                const result = await this.tripService.updateTrip(tripId, updateData);

                expect(result.success).toBe(true);
                expect(result.trip.title).toBe(updateData.title);
                expect(result.trip.description).toBe(updateData.description);
                expect(result.trip.budget).toBe(updateData.budget);
                expect(result.trip.updatedAt).not.toBe(result.trip.createdAt);
            });

            it('应该验证更新数据', async () => {
                const tripId = 'trip123';
                const invalidUpdateData = {
                    startDate: new Date('2024-06-03'),
                    endDate: new Date('2024-06-01') // 无效日期范围
                };

                const validation = this.tripValidator.validateTripUpdate(invalidUpdateData);

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('结束日期必须晚于开始日期');
            });

            it('应该处理行程状态更新', async () => {
                const tripId = 'trip123';
                const statusUpdate = { status: 'ACTIVE' };

                const result = await this.tripService.updateTripStatus(tripId, statusUpdate.status);

                expect(result.success).toBe(true);
                expect(result.trip.status).toBe('ACTIVE');
            });

            it('应该防止无效状态转换', async () => {
                const tripId = 'trip123';

                // 尝试从COMPLETED状态转换到ACTIVE状态
                const result = await this.tripService.updateTripStatus(tripId, 'ACTIVE');

                expect(result.success).toBe(false);
                expect(result.error).toContain('无效的状态转换');
            });

            it('应该记录更新历史', async () => {
                const tripId = 'trip123';
                const updateData = { budget: 7000 };

                const result = await this.tripService.updateTrip(tripId, updateData);

                expect(result.success).toBe(true);
                expect(result.updateHistory).toBeDefined();
                expect(result.updateHistory.length).toBeGreaterThan(0);
                expect(result.updateHistory[0].field).toBe('budget');
                expect(result.updateHistory[0].oldValue).toBe(6000);
                expect(result.updateHistory[0].newValue).toBe(7000);
            });
        });
    }

    /**
     * 测试行程删除功能
     */
    testTripDeletion() {
        describe('行程删除功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功删除行程', async () => {
                const tripId = 'trip123';

                const result = await this.tripService.deleteTrip(tripId);

                expect(result.success).toBe(true);
                expect(result.deletedCount).toBe(1);
            });

            it('应该验证删除权限', async () => {
                const tripId = 'trip123';
                const userId = 'user456'; // 非行程创建者

                const result = await this.tripService.deleteTrip(tripId, userId);

                expect(result.success).toBe(false);
                expect(result.error).toContain('无删除权限');
            });

            it('应该处理不存在的行程删除', async () => {
                const nonExistentTripId = 'non-existent-id';

                const result = await this.tripService.deleteTrip(nonExistentTripId);

                expect(result.success).toBe(false);
                expect(result.error).toContain('行程不存在');
            });

            it('应该软删除行程', async () => {
                const tripId = 'trip123';

                const result = await this.tripService.softDeleteTrip(tripId);

                expect(result.success).toBe(true);
                expect(result.trip.deleted).toBe(true);
                expect(result.trip.deletedAt).toBeDefined();
            });

            it('应该恢复软删除的行程', async () => {
                const tripId = 'trip123';

                const result = await this.tripService.restoreTrip(tripId);

                expect(result.success).toBe(true);
                expect(result.trip.deleted).toBe(false);
                expect(result.trip.deletedAt).toBeNull();
            });
        });
    }

    /**
     * 测试行程统计功能
     */
    testTripStatistics() {
        describe('行程统计功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该计算行程统计信息', async () => {
                const userId = 'user123';

                const result = await this.tripService.getTripStatistics(userId);

                expect(result.success).toBe(true);
                expect(result.statistics.totalTrips).toBeGreaterThanOrEqual(0);
                expect(result.statistics.activeTrips).toBeGreaterThanOrEqual(0);
                expect(result.statistics.completedTrips).toBeGreaterThanOrEqual(0);
                expect(result.statistics.averageBudget).toBeGreaterThanOrEqual(0);
                expect(result.statistics.totalBudget).toBeGreaterThanOrEqual(0);
            });

            it('应该按目的地统计行程', async () => {
                const result = await this.tripService.getDestinationStatistics();

                expect(result.success).toBe(true);
                expect(Array.isArray(result.destinations)).toBe(true);
                result.destinations.forEach(dest => {
                    expect(dest.name).toBeDefined();
                    expect(dest.tripCount).toBeGreaterThanOrEqual(0);
                    expect(dest.averageBudget).toBeGreaterThanOrEqual(0);
                });
            });

            it('应该分析行程趋势', async () => {
                const timeRange = {
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31')
                };

                const result = await this.tripService.analyzeTripTrends(timeRange);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.trends)).toBe(true);
                expect(result.trends.length).toBeGreaterThan(0);
            });

            it('应该生成行程报告', async () => {
                const reportConfig = {
                    format: 'PDF',
                    includeDetails: true,
                    includeStatistics: true
                };

                const result = await this.tripService.generateTripReport(reportConfig);

                expect(result.success).toBe(true);
                expect(result.report.content).toBeDefined();
                expect(result.report.format).toBe('PDF');
                expect(result.report.generatedAt).toBeDefined();
            });
        });
    }

    /**
     * 测试行程控制器功能
     */
    testTripController() {
        describe('行程控制器功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该处理创建行程请求', async () => {
                const request = {
                    body: {
                        title: '北京三日游',
                        destination: '北京',
                        startDate: '2024-06-01',
                        endDate: '2024-06-03'
                    },
                    user: { id: 'user123' }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.tripController.createTrip(request, response);

                expect(response.status).toHaveBeenCalledWith(201);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        trip: expect.any(Object)
                    })
                );
            });

            it('应该处理获取行程列表请求', async () => {
                const request = {
                    query: { page: '1', limit: '10' },
                    user: { id: 'user123' }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.tripController.getTrips(request, response);

                expect(response.status).toHaveBeenCalledWith(200);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        trips: expect.any(Array)
                    })
                );
            });

            it('应该处理行程更新请求', async () => {
                const request = {
                    params: { id: 'trip123' },
                    body: { title: '更新后的标题' },
                    user: { id: 'user123' }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.tripController.updateTrip(request, response);

                expect(response.status).toHaveBeenCalledWith(200);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        trip: expect.any(Object)
                    })
                );
            });

            it('应该处理错误响应', async () => {
                const request = {
                    params: { id: 'invalid-id' },
                    user: { id: 'user123' }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.tripController.getTrip(request, response);

                expect(response.status).toHaveBeenCalledWith(404);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.any(String)
                    })
                );
            });
        });
    }

    /**
     * 测试错误处理
     */
    testErrorHandling() {
        describe('行程管理错误处理测试', () => {
            it('应该处理数据库连接错误', async () => {
                // 模拟数据库错误
                jest.spyOn(this.tripService, 'createTrip').mockRejectedValue(new Error('数据库连接失败'));

                await expect(this.tripService.createTrip({})).rejects.toThrow('数据库连接失败');
            });

            it('应该处理数据验证错误', async () => {
                // 模拟验证错误
                jest.spyOn(this.tripValidator, 'validateTripData').mockReturnValue({
                    isValid: false,
                    errors: ['标题不能为空', '目的地不能为空']
                });

                const validation = this.tripValidator.validateTripData({});

                expect(validation.isValid).toBe(false);
                expect(validation.errors.length).toBe(2);
            });

            it('应该处理权限验证错误', async () => {
                // 模拟权限错误
                jest.spyOn(this.tripService, 'deleteTrip').mockResolvedValue({
                    success: false,
                    error: '无删除权限'
                });

                const result = await this.tripService.deleteTrip('trip123', 'unauthorized-user');

                expect(result.success).toBe(false);
                expect(result.error).toBe('无删除权限');
            });

            it('应该处理并发更新冲突', async () => {
                // 模拟并发冲突
                jest.spyOn(this.tripService, 'updateTrip').mockRejectedValue(new Error('数据已被其他用户修改'));

                await expect(this.tripService.updateTrip('trip123', {})).rejects.toThrow('数据已被其他用户修改');
            });
        });
    }

    /**
     * 运行所有行程管理模块测试
     */
    runAllTests() {
        describe('行程管理模块 - 完整测试套件', () => {
            this.testTripCreation();
            this.testTripQuery();
            this.testTripUpdate();
            this.testTripDeletion();
            this.testTripStatistics();
            this.testTripController();
            this.testErrorHandling();
        });
    }
}

/**
 * 创建行程管理测试套件实例
 */
export const createTripTestSuite = () => {
    return new TripTestSuite();
};