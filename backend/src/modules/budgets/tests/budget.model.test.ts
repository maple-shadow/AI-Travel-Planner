import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { BudgetModel } from '../models/budget.model'
import { BudgetData, CreateBudgetData, UpdateBudgetData, BudgetStatus, BudgetCategory } from '../types/budget.types'

describe('BudgetModel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('createBudget', () => {
        it('应该成功创建预算', async () => {
            const mockBudgetData: CreateBudgetData = {
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                category: BudgetCategory.TRANSPORTATION
            }

            const mockResponse = {
                data: {
                    id: 'budget-123',
                    ...mockBudgetData,
                    used_amount: 0,
                    currency: 'USD',
                    status: BudgetStatus.ACTIVE,
                    created_at: new Date('2024-01-01T00:00:00Z'),
                    updated_at: new Date('2024-01-01T00:00:00Z')
                },
                error: null
            }

            // Mock Supabase client
            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

            // Mock the getSupabaseClient function
            jest.spyOn(BudgetModel, 'getSupabaseClient').mockReturnValue(mockSupabase as any)

            const result = await BudgetModel.createBudget(mockBudgetData)

            expect(BudgetModel.getSupabaseClient).toHaveBeenCalled()
            expect(mockSupabase.from).toHaveBeenCalledWith('budgets')
            expect(mockSupabase.insert).toHaveBeenCalledWith(mockBudgetData)
            expect(result).toEqual(mockResponse.data)
        })

        it('应该在创建预算失败时返回null', async () => {
            const mockBudgetData: CreateBudgetData = {
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                category: BudgetCategory.TRANSPORTATION
            }

            const mockResponse = {
                data: null,
                error: { message: '创建失败' }
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

            jest.spyOn(BudgetModel, 'getSupabaseClient').mockReturnValue(mockSupabase as any)

            const result = await BudgetModel.createBudget(mockBudgetData)

            expect(result).toBeNull()
        })
    })

    describe('findBudgetById', () => {
        it('应该成功查找预算', async () => {
            const budgetId = 'budget-123'
            const mockBudget: BudgetData = {
                id: budgetId,
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                used_amount: 0,
                currency: 'USD',
                status: BudgetStatus.ACTIVE,
                category: BudgetCategory.TRANSPORTATION,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-01T00:00:00Z')
            }

            const mockResponse = {
                data: mockBudget,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await BudgetModel.findBudgetById(budgetId)
            expect(mockSupabase.from).toHaveBeenCalledWith('budgets')
            expect(mockSupabase.select).toHaveBeenCalledWith('*')
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', budgetId)
            expect(result).toEqual(mockBudget)
        })

        it('应该在预算不存在时返回null', async () => {
            const budgetId = 'non-existent-budget'

            const mockResponse = {
                data: null,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await BudgetModel.findBudgetById(budgetId)

            expect(result).toBeNull()
        })
    })

    describe('findBudgetByTripId', () => {
        it('应该成功根据行程ID查找预算', async () => {
            const tripId = 'trip-123'
            const mockBudget: BudgetData = {
                id: 'budget-123',
                trip_id: tripId,
                user_id: 'user-123',
                total_amount: 1000,
                used_amount: 0,
                currency: 'USD',
                status: BudgetStatus.ACTIVE,
                category: BudgetCategory.TRANSPORTATION,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-01T00:00:00Z')
            }

            const mockResponse = {
                data: mockBudget,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await BudgetModel.findBudgetByTripId(tripId)
            expect(mockSupabase.from).toHaveBeenCalledWith('budgets')
            expect(mockSupabase.select).toHaveBeenCalledWith('*')
            expect(mockSupabase.eq).toHaveBeenCalledWith('trip_id', tripId)
            expect(result).toEqual(mockBudget)
        })
    })

    describe('updateBudget', () => {
        it('应该成功更新预算', async () => {
            const budgetId = 'budget-123'
            const updateData: UpdateBudgetData = {
                total_amount: 1500,
                status: BudgetStatus.COMPLETED
            }

            const mockUpdatedBudget: BudgetData = {
                id: budgetId,
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1500,
                used_amount: 0,
                currency: 'USD',
                status: BudgetStatus.COMPLETED,
                category: BudgetCategory.TRANSPORTATION,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-02T00:00:00Z')
            }

            const mockResponse = {
                data: mockUpdatedBudget,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await BudgetModel.updateBudget(budgetId, updateData)
            expect(mockSupabase.from).toHaveBeenCalledWith('budgets')
            expect(mockSupabase.update).toHaveBeenCalledWith(updateData)
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', budgetId)
            expect(result).toEqual(mockUpdatedBudget)
        })
    })

    describe('calculateBudgetUsage', () => {
        it('应该正确计算预算使用率', () => {
            const budget: BudgetData = {
                id: 'budget-123',
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                used_amount: 250,
                currency: 'USD',
                status: BudgetStatus.ACTIVE,
                category: BudgetCategory.TRANSPORTATION,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-01T00:00:00Z')
            }

            const usage = BudgetModel.calculateBudgetUsage(budget)

            expect(usage.percentage).toBe(25)
            expect(usage.remaining).toBe(750)
            expect(usage.isOverBudget).toBe(false)
        })

        it('应该在预算超额时返回正确状态', () => {
            const budget: BudgetData = {
                id: 'budget-123',
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                used_amount: 1200,
                currency: 'USD',
                status: BudgetStatus.OVER_BUDGET,
                category: BudgetCategory.TRANSPORTATION,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-01T00:00:00Z')
            }

            const usage = BudgetModel.calculateBudgetUsage(budget)

            expect(usage.percentage).toBe(120)
            expect(usage.remaining).toBe(-200)
            expect(usage.isOverBudget).toBe(true)
        })
    })
})