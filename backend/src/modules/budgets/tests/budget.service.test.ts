import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { BudgetService } from '../services/budget.service'
import { BudgetModel } from '../models/budget.model'
import { ExpenseModel } from '../models/expense.model'
import { BudgetValidators } from '../validators/budget.validators'
import { BudgetData, ExpenseData, CreateBudgetData, CreateExpenseData, BudgetOperationResult, BudgetStatus, BudgetCategory, ExpenseType, BudgetAnalysisReport } from '../types/budget.types'

// Mock the models
jest.mock('../models/budget.model')
jest.mock('../models/expense.model')
jest.mock('../validators/budget.validators')

describe('BudgetService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('createBudget', () => {
        it('应该成功创建预算', async () => {
            const createData: CreateBudgetData = {
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                category: BudgetCategory.TRANSPORTATION
            }

            const mockBudget: BudgetData = {
                id: 'budget-123',
                ...createData,
                used_amount: 0,
                currency: 'USD',
                status: BudgetStatus.ACTIVE,
                category: BudgetCategory.TRANSPORTATION,
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-01T00:00:00Z')
            }

            jest.spyOn(BudgetValidators, 'validateCreateBudget').mockReturnValue([])
            jest.spyOn(BudgetModel, 'findBudgetByTripId').mockResolvedValue(null)
            jest.spyOn(BudgetModel, 'createBudget').mockResolvedValue(mockBudget)

            const result = await BudgetService.createBudget(createData)

            expect(BudgetValidators.validateCreateBudget).toHaveBeenCalledWith(createData)
            expect(BudgetModel.findBudgetByTripId).toHaveBeenCalledWith(createData.trip_id)
            expect(BudgetModel.createBudget).toHaveBeenCalledWith(createData)
            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockBudget)
        })

        it('应该在验证失败时返回错误', async () => {
            const createData: CreateBudgetData = {
                trip_id: '', // 无效的行程ID
                user_id: 'user-123',
                total_amount: -100, // 无效的金额
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31')
            }

            const validationErrors = [
                { field: 'trip_id', message: '行程ID不能为空', code: 'TRIP_ID_REQUIRED' },
                { field: 'total_amount', message: '总金额必须大于0', code: 'TOTAL_AMOUNT_INVALID' }
            ]

            const validateCreateBudgetMock = jest.spyOn(BudgetValidators, 'validateCreateBudget').mockReturnValue(validationErrors)
            const createBudgetMock = jest.spyOn(BudgetModel, 'createBudget')

            const result = await BudgetService.createBudget(createData)

            expect(validateCreateBudgetMock).toHaveBeenCalledWith(createData)
            expect(result.success).toBe(false)
            expect(result.validationErrors).toEqual(validationErrors)
            expect(createBudgetMock).not.toHaveBeenCalled()
        })

        it('应该在行程已存在预算时返回错误', async () => {
            const createData: CreateBudgetData = {
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 1000,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31')
            }

            const existingBudget: BudgetData = {
                id: 'existing-budget',
                trip_id: 'trip-123',
                user_id: 'user-123',
                total_amount: 500,
                used_amount: 0,
                currency: 'USD',
                status: BudgetStatus.ACTIVE,
                category: BudgetCategory.TRANSPORTATION,
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-01-31'),
                created_at: new Date('2024-01-01T00:00:00Z'),
                updated_at: new Date('2024-01-01T00:00:00Z')
            }

            jest.spyOn(BudgetValidators, 'validateCreateBudget').mockReturnValue([])
            jest.spyOn(BudgetModel, 'findBudgetByTripId').mockResolvedValue(existingBudget)
            const createBudgetMock = jest.spyOn(BudgetModel, 'createBudget')

            const result = await BudgetService.createBudget(createData)

            expect(result.success).toBe(false)
            expect(result.error).toBe('该行程已存在预算')
            expect(createBudgetMock).not.toHaveBeenCalled()
        })
    })

    describe('getBudgetById', () => {
        it('应该成功获取预算', async () => {
            const budgetId = 'budget-123'
            const mockBudget: BudgetData = {
                id: budgetId,
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

            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)

            const result = await BudgetService.getBudgetById(budgetId)

            expect(BudgetModel.findBudgetById).toHaveBeenCalledWith(budgetId)
            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockBudget)
        })

        it('应该在预算不存在时返回错误', async () => {
            const budgetId = 'non-existent-budget'

            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(null)

            const result = await BudgetService.getBudgetById(budgetId)

            expect(result.success).toBe(false)
            expect(result.error).toBe('预算不存在')
        })
    })

    describe('addExpense', () => {
        it('应该成功添加开销', async () => {
            const createData: CreateExpenseData = {
                budget_id: 'budget-123',
                user_id: 'user-123',
                amount: 100,
                category: BudgetCategory.TRANSPORTATION,
                description: '交通费用',
                date: new Date('2024-01-15')
            }

            const mockExpense: ExpenseData = {
                id: 'expense-123',
                ...createData,
                currency: 'USD',
                type: ExpenseType.ONE_TIME,
                created_at: new Date('2024-01-15T00:00:00Z'),
                updated_at: new Date('2024-01-15T00:00:00Z')
            }

            jest.spyOn(BudgetValidators, 'validateCreateExpense').mockReturnValue([])
            jest.spyOn(ExpenseModel, 'addExpense').mockResolvedValue(mockExpense)

            const result = await BudgetService.addExpense(createData)

            expect(BudgetValidators.validateCreateExpense).toHaveBeenCalledWith(createData)
            expect(ExpenseModel.addExpense).toHaveBeenCalledWith(createData)
            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockExpense)
        })

        it('应该在验证失败时返回错误', async () => {
            const createData: CreateExpenseData = {
                budget_id: '', // 无效的预算ID
                user_id: 'user-123',
                amount: -100, // 无效的金额
                category: BudgetCategory.TRANSPORTATION,
                description: '交通费用',
                date: new Date('2024-01-15')
            }

            const validationErrors = [
                { field: 'budget_id', message: '预算ID不能为空', code: 'BUDGET_ID_REQUIRED' },
                { field: 'amount', message: '金额必须大于0', code: 'AMOUNT_INVALID' }
            ]

            const validateCreateExpenseMock = jest.spyOn(BudgetValidators, 'validateCreateExpense').mockReturnValue(validationErrors)
            const addExpenseMock = jest.spyOn(ExpenseModel, 'addExpense')

            const result = await BudgetService.addExpense(createData)

            expect(validateCreateExpenseMock).toHaveBeenCalledWith(createData)
            expect(result.success).toBe(false)
            expect(result.validationErrors).toEqual(validationErrors)
            expect(addExpenseMock).not.toHaveBeenCalled()
        })
    })

    describe('getBudgetUsage', () => {
        it('应该正确获取预算使用情况', async () => {
            const budgetId = 'budget-123'
            const mockBudget: BudgetData = {
                id: budgetId,
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

            const mockUsage = {
                percentage: 25,
                remaining: 750,
                isOverBudget: false
            }

            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'calculateBudgetUsage').mockReturnValue(mockUsage)

            const result = await BudgetService.getBudgetUsage(budgetId)

            expect(BudgetModel.findBudgetById).toHaveBeenCalledWith(budgetId)
            expect(BudgetModel.calculateBudgetUsage).toHaveBeenCalledWith(mockBudget)
            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockUsage)
        })
    })

    describe('analyzeExpenseTrends', () => {
        it('应该正确分析开销趋势', async () => {
            const budgetId = 'budget-123'
            const mockTrends = [
                { period: '2024-01-15', amount: 200, count: 1 },
                { period: '2024-01-16', amount: 300, count: 1 }
            ]

            jest.spyOn(ExpenseModel, 'analyzeExpenseTrends').mockResolvedValue(mockTrends)

            const result = await BudgetService.analyzeExpenseTrends(budgetId, 'daily')

            expect(ExpenseModel.analyzeExpenseTrends).toHaveBeenCalledWith(budgetId, 'daily')
            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockTrends)
        })
    })

    describe('generateBudgetReport', () => {
        it('应该成功生成预算报告', async () => {
            const budgetId = 'budget-123'
            const mockBudget: BudgetData = {
                id: budgetId,
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

            const mockUsage = {
                percentage: 25,
                remaining: 750,
                isOverBudget: false
            }

            const mockExpenseStats = {
                total_expenses: 2,
                total_amount: 250,
                average_expense: 125,
                category_distribution: {
                    [BudgetCategory.TRANSPORTATION]: 250,
                    [BudgetCategory.ACCOMMODATION]: 0,
                    [BudgetCategory.FOOD]: 0,
                    [BudgetCategory.ACTIVITIES]: 0,
                    [BudgetCategory.SHOPPING]: 0,
                    [BudgetCategory.EMERGENCY]: 0,
                    [BudgetCategory.OTHER]: 0
                },
                type_distribution: {
                    [ExpenseType.FIXED]: 0,
                    [ExpenseType.VARIABLE]: 0,
                    [ExpenseType.ONE_TIME]: 250,
                    [ExpenseType.RECURRING]: 0
                },
                daily_average: 125,
                monthly_average: 250
            }

            const mockTrends = [
                { period: '2024-01-15', amount: 200, count: 1 },
                { period: '2024-01-16', amount: 300, count: 1 }
            ]

            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'calculateBudgetUsage').mockReturnValue(mockUsage)
            jest.spyOn(ExpenseModel, 'getExpenseStats').mockResolvedValue(mockExpenseStats)
            jest.spyOn(ExpenseModel, 'analyzeExpenseTrends').mockResolvedValue(mockTrends)

            const result = await BudgetService.generateBudgetReport(budgetId)

            expect(result.success).toBe(true)
            expect(result.data).toBeDefined()
            expect((result.data as BudgetAnalysisReport).budget_id).toBe(budgetId)
            expect((result.data as BudgetAnalysisReport).trip_id).toBe('trip-123')
            expect((result.data as BudgetAnalysisReport).total_budget).toBe(1000)
            expect((result.data as BudgetAnalysisReport).total_expenses).toBe(250)
        })

        it('应该在预算不存在时返回错误', async () => {
            const budgetId = 'non-existent-budget'

            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(null)

            const result = await BudgetService.generateBudgetReport(budgetId)

            expect(result.success).toBe(false)
            expect(result.error).toBe('预算不存在')
        })
    })
})