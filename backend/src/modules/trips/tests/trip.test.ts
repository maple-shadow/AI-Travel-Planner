import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { TripModel } from '../models/trip.model'
import { TripValidators } from '../validators/trip.validators'
import { TripTypes } from '../types/trip.types'

// Mock数据库连接
jest.mock('../../../../core/database', () => ({
    databaseConnection: {
        from: jest.fn(() => ({
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: {
                            id: 'test-trip-id',
                            user_id: 'test-user-id',
                            title: '测试行程',
                            destination: '测试目的地',
                            start_date: new Date('2024-01-01'),
                            end_date: new Date('2024-01-03'),
                            status: TripTypes.TripStatus.PLANNING,
                            type: TripTypes.TripType.LEISURE,
                            priority: TripTypes.TripPriority.MEDIUM,
                            created_at: new Date(),
                            updated_at: new Date()
                        },
                        error: null
                    }))
                }))
            })),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: {
                            id: 'test-trip-id',
                            user_id: 'test-user-id',
                            title: '测试行程',
                            destination: '测试目的地',
                            start_date: new Date('2024-01-01'),
                            end_date: new Date('2024-01-03'),
                            status: TripTypes.TripStatus.PLANNING,
                            type: TripTypes.TripType.LEISURE,
                            priority: TripTypes.TripPriority.MEDIUM,
                            created_at: new Date(),
                            updated_at: new Date()
                        },
                        error: null
                    }))
                }))
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn(() => ({
                            data: {
                                id: 'test-trip-id',
                                user_id: 'test-user-id',
                                title: '更新后的行程',
                                destination: '测试目的地',
                                start_date: new Date('2024-01-01'),
                                end_date: new Date('2024-01-03'),
                                status: TripTypes.TripStatus.PLANNING,
                                type: TripTypes.TripType.LEISURE,
                                priority: TripTypes.TripPriority.MEDIUM,
                                created_at: new Date(),
                                updated_at: new Date()
                            },
                            error: null
                        }))
                    }))
                }))
            })),
            delete: jest.fn(() => ({
                eq: jest.fn(() => ({
                    error: null
                }))
            }))
        }))
    }
}))

describe('行程数据模型模块', () => {
    describe('TripModel', () => {
        describe('createTrip', () => {
            it('应该成功创建行程', async () => {
                const tripData = {
                    user_id: 'test-user-id',
                    title: '测试行程',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03'),
                    status: TripTypes.TripStatus.PLANNING,
                    type: TripTypes.TripType.LEISURE,
                    priority: TripTypes.TripPriority.MEDIUM
                }

                const result = await TripModel.createTrip(tripData)

                expect(result).toBeDefined()
                expect(result.id).toBe('test-trip-id')
                expect(result.title).toBe('测试行程')
                expect(result.user_id).toBe('test-user-id')
            })

            it('应该处理数据库错误', async () => {
                // Mock数据库错误
                const mockDatabaseConnection = {
                    from: jest.fn(() => ({
                        insert: jest.fn(() => ({
                            select: jest.fn(() => ({
                                single: jest.fn(() => ({
                                    data: null,
                                    error: { message: '数据库错误' }
                                }))
                            }))
                        }))
                    }))
                }

                // 临时替换databaseConnection
                const originalConnection = require('../../../../core/database').databaseConnection
                require('../../../../core/database').databaseConnection = mockDatabaseConnection

                const tripData = {
                    user_id: 'test-user-id',
                    title: '测试行程',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03')
                }

                await expect(TripModel.createTrip(tripData)).rejects.toThrow('创建行程失败: 数据库错误')

                // 恢复原始连接
                require('../../../../core/database').databaseConnection = originalConnection
            })
        })

        describe('findTripById', () => {
            it('应该根据ID找到行程', async () => {
                const trip = await TripModel.findTripById('test-trip-id')

                expect(trip).toBeDefined()
                expect(trip?.id).toBe('test-trip-id')
                expect(trip?.title).toBe('测试行程')
            })

            it('应该返回null当行程不存在时', async () => {
                // Mock未找到记录的情况
                const mockDatabaseConnection = {
                    from: jest.fn(() => ({
                        select: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                single: jest.fn(() => ({
                                    data: null,
                                    error: { code: 'PGRST116' }
                                }))
                            }))
                        }))
                    }))
                }

                const originalConnection = require('../../../../core/database').databaseConnection
                require('../../../../core/database').databaseConnection = mockDatabaseConnection

                const trip = await TripModel.findTripById('non-existent-id')

                expect(trip).toBeNull()

                require('../../../../core/database').databaseConnection = originalConnection
            })
        })

        describe('updateTrip', () => {
            it('应该成功更新行程', async () => {
                const updateData = {
                    title: '更新后的行程',
                    description: '更新后的描述'
                }

                const result = await TripModel.updateTrip('test-trip-id', updateData)

                expect(result).toBeDefined()
                expect(result.title).toBe('更新后的行程')
            })
        })

        describe('deleteTrip', () => {
            it('应该成功删除行程', async () => {
                const result = await TripModel.deleteTrip('test-trip-id')

                expect(result).toBe(true)
            })
        })

        describe('listUserTrips', () => {
            it('应该列出用户行程', async () => {
                // Mock多记录返回
                const mockDatabaseConnection = {
                    from: jest.fn(() => ({
                        select: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                order: jest.fn(() => ({
                                    data: [
                                        {
                                            id: 'trip-1',
                                            user_id: 'test-user-id',
                                            title: '行程1',
                                            destination: '目的地1',
                                            start_date: new Date('2024-01-01'),
                                            end_date: new Date('2024-01-03'),
                                            status: TripTypes.TripStatus.PLANNING,
                                            type: TripTypes.TripType.LEISURE,
                                            priority: TripTypes.TripPriority.MEDIUM,
                                            created_at: new Date(),
                                            updated_at: new Date()
                                        },
                                        {
                                            id: 'trip-2',
                                            user_id: 'test-user-id',
                                            title: '行程2',
                                            destination: '目的地2',
                                            start_date: new Date('2024-02-01'),
                                            end_date: new Date('2024-02-03'),
                                            status: TripTypes.TripStatus.CONFIRMED,
                                            type: TripTypes.TripType.BUSINESS,
                                            priority: TripTypes.TripPriority.HIGH,
                                            created_at: new Date(),
                                            updated_at: new Date()
                                        }
                                    ],
                                    error: null
                                }))
                            }))
                        }))
                    }))
                }

                const originalConnection = require('../../../../core/database').databaseConnection
                require('../../../../core/database').databaseConnection = mockDatabaseConnection

                const trips = await TripModel.listUserTrips('test-user-id')

                expect(trips).toHaveLength(2)
                expect(trips[0].title).toBe('行程1')
                expect(trips[1].title).toBe('行程2')

                require('../../../../core/database').databaseConnection = originalConnection
            })
        })
    })

    describe('TripValidators', () => {
        describe('validateTripData', () => {
            it('应该验证有效的行程数据', () => {
                const validTripData = {
                    title: '测试行程',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03')
                }

                const errors = TripValidators.validateTripData(validTripData)

                expect(errors).toHaveLength(0)
            })

            it('应该检测空的标题', () => {
                const invalidTripData = {
                    title: '',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03')
                }

                const errors = TripValidators.validateTripData(invalidTripData)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('title')
                expect(errors[0].code).toBe('TITLE_REQUIRED')
            })

            it('应该检测过长的标题', () => {
                const longTitle = 'a'.repeat(101)
                const invalidTripData = {
                    title: longTitle,
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03')
                }

                const errors = TripValidators.validateTripData(invalidTripData)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('title')
                expect(errors[0].code).toBe('TITLE_TOO_LONG')
            })

            it('应该检测无效的日期关系', () => {
                const invalidTripData = {
                    title: '测试行程',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-03'),
                    end_date: new Date('2024-01-01') // 结束日期早于开始日期
                }

                const errors = TripValidators.validateTripData(invalidTripData)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('end_date')
                expect(errors[0].code).toBe('END_DATE_BEFORE_START')
            })

            it('应该检测负数的预算', () => {
                const invalidTripData = {
                    title: '测试行程',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03'),
                    budget: -100
                }

                const errors = TripValidators.validateTripData(invalidTripData)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('budget')
                expect(errors[0].code).toBe('NEGATIVE_BUDGET')
            })

            it('应该检测过多的标签', () => {
                const manyTags = Array.from({ length: 11 }, (_, i) => `标签${i + 1}`)
                const invalidTripData = {
                    title: '测试行程',
                    destination: '测试目的地',
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03'),
                    tags: manyTags
                }

                const errors = TripValidators.validateTripData(invalidTripData)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('tags')
                expect(errors[0].code).toBe('TOO_MANY_TAGS')
            })
        })

        describe('validateTripDates', () => {
            it('应该验证有效的日期', () => {
                const startDate = new Date('2024-01-01')
                const endDate = new Date('2024-01-03')

                const errors = TripValidators.validateTripDates(startDate, endDate)

                expect(errors).toHaveLength(0)
            })

            it('应该检测过去的开始日期', () => {
                const pastDate = new Date('2020-01-01')
                const futureDate = new Date('2024-01-03')

                const errors = TripValidators.validateTripDates(pastDate, futureDate)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('start_date')
                expect(errors[0].code).toBe('START_DATE_IN_PAST')
            })

            it('应该检测过长的行程时长', () => {
                const startDate = new Date('2024-01-01')
                const endDate = new Date('2028-01-01') // 4年后

                const errors = TripValidators.validateTripDates(startDate, endDate)

                expect(errors).toHaveLength(1)
                expect(errors[0].field).toBe('end_date')
                expect(errors[0].code).toBe('TRIP_DURATION_TOO_LONG')
            })
        })

        describe('validateTripBudget', () => {
            it('应该验证有效的预算', () => {
                const errors = TripValidators.validateTripBudget(5000)

                expect(errors).toHaveLength(0)
            })

            it('应该检测负数的预算', () => {
                const errors = TripValidators.validateTripBudget(-100)

                expect(errors).toHaveLength(1)
                expect(errors[0].code).toBe('NEGATIVE_BUDGET')
            })

            it('应该检测过高的预算', () => {
                const errors = TripValidators.validateTripBudget(20000000) // 2000万

                expect(errors).toHaveLength(1)
                expect(errors[0].code).toBe('BUDGET_TOO_HIGH')
            })
        })

        describe('validateTripId', () => {
            it('应该验证有效的UUID', () => {
                const errors = TripValidators.validateTripId('123e4567-e89b-12d3-a456-426614174000')

                expect(errors).toHaveLength(0)
            })

            it('应该检测空的ID', () => {
                const errors = TripValidators.validateTripId('')

                expect(errors).toHaveLength(1)
                expect(errors[0].code).toBe('ID_REQUIRED')
            })

            it('应该检测无效的UUID格式', () => {
                const errors = TripValidators.validateTripId('invalid-uuid')

                expect(errors).toHaveLength(1)
                expect(errors[0].code).toBe('INVALID_ID_FORMAT')
            })
        })
    })

    describe('TripTypes', () => {
        it('应该包含正确的状态枚举', () => {
            expect(TripTypes.TripStatus.PLANNING).toBe('planning')
            expect(TripTypes.TripStatus.CONFIRMED).toBe('confirmed')
            expect(TripTypes.TripStatus.IN_PROGRESS).toBe('in_progress')
            expect(TripTypes.TripStatus.COMPLETED).toBe('completed')
            expect(TripTypes.TripStatus.CANCELLED).toBe('cancelled')
            expect(TripTypes.TripStatus.POSTPONED).toBe('postponed')
        })

        it('应该包含正确的类型枚举', () => {
            expect(TripTypes.TripType.BUSINESS).toBe('business')
            expect(TripTypes.TripType.LEISURE).toBe('leisure')
            expect(TripTypes.TripType.FAMILY).toBe('family')
            expect(TripTypes.TripType.ADVENTURE).toBe('adventure')
            expect(TripTypes.TripType.EDUCATIONAL).toBe('educational')
            expect(TripTypes.TripType.OTHER).toBe('other')
        })

        it('应该包含正确的优先级枚举', () => {
            expect(TripTypes.TripPriority.LOW).toBe('low')
            expect(TripTypes.TripPriority.MEDIUM).toBe('medium')
            expect(TripTypes.TripPriority.HIGH).toBe('high')
            expect(TripTypes.TripPriority.URGENT).toBe('urgent')
        })
    })
})

describe('行程模块集成测试', () => {
    it('应该能够初始化模块', async () => {
        const { initializeTripModule } = await import('../index')

        // Mock数据库连接检查
        const mockDatabaseConnection = {
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    limit: jest.fn(() => ({
                        data: [],
                        error: null
                    }))
                }))
            }))
        }

        const originalConnection = require('../../../../core/database').databaseConnection
        require('../../../../core/database').databaseConnection = mockDatabaseConnection

        // Mock迁移函数
        const mockRunMigration = jest.fn().mockResolvedValue(undefined)
        jest.doMock('../migrations/create_trips_table', () => ({
            runMigration: mockRunMigration
        }))

        const result = await initializeTripModule()

        expect(result).toBe(true)
        expect(mockRunMigration).toHaveBeenCalled()

        require('../../../../core/database').databaseConnection = originalConnection
    })

    it('应该能够进行健康检查', async () => {
        const { healthCheck } = await import('../index')

        // Mock健康检查场景
        const mockDatabaseConnection = {
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    limit: jest.fn(() => ({
                        data: [],
                        error: null
                    }))
                }))
            }))
        }

        const originalConnection = require('../../../../core/database').databaseConnection
        require('../../../../core/database').databaseConnection = mockDatabaseConnection

        const result = await healthCheck()

        expect(result.status).toBeDefined()
        expect(result.message).toBeDefined()

        require('../../../../core/database').databaseConnection = originalConnection
    })
})