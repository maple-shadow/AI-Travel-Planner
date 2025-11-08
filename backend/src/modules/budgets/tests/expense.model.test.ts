import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { ExpenseModel } from '../models/expense.model'
import { BudgetModel } from '../models/budget.model'
import { ExpenseData, CreateExpenseData, UpdateExpenseData, ExpenseType, BudgetCategory } from '../types/budget.types'
import { databaseConnection } from '../../../core/database'

describe('ExpenseModel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('addExpense', () => {
        it('应该成功添加开销', async () => {
            const mockExpenseData: CreateExpenseData = {
                budget_id: 'budget-123',
                user_id: 'user-123',
                title: '交通费用',
                amount: 100,
                type: ExpenseType.TRANSPORTATION,
                expense_date: new Date('2024-01-15')
            }

            const mockResponse = {
                data: {
                    id: 'expense-123',
                    ...mockExpenseData,
                    created_at: new Date('2024-01-15T00:00:00Z'),
                    updated_at: new Date('2024-01-15T00:00:00Z')
                },
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

            // Mock the databaseConnection
            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'updateBudgetAmounts').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'checkAndUpdateBudgetStatus').mockResolvedValue()
                ; (databaseConnection as any) = mockSupabase

            const result = await ExpenseModel.addExpense(mockExpenseData)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.insert).toHaveBeenCalledWith(mockExpenseData)
            expect(result).toEqual(mockResponse.data)
        })

        it('应该在添加开销失败时返回null', async () => {
            const mockExpenseData: CreateExpenseData = {
                budget_id: 'budget-123',
                user_id: 'user-123',
                title: '交通费用',
                amount: 100,
                type: ExpenseType.TRANSPORTATION,
                expense_date: new Date('2024-01-15')
            }

            const mockResponse = {
                data: null,
                error: { message: '添加失败' }
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)
                ; (databaseConnection as any) = mockSupabase

            const result = await ExpenseModel.addExpense(mockExpenseData)

            expect(result).toBeNull()
        })
    })

    describe('findExpenseById', () => {
        it('应该成功查找开销', async () => {
            const expenseId = 'expense-123'
            const mockExpense: ExpenseData = {
                id: expenseId,
                budget_id: 'budget-123',
                user_id: 'user-123',
                title: '交通费用',
                amount: 100,
                type: ExpenseType.TRANSPORTATION,
                expense_date: new Date('2024-01-15'),
                created_at: new Date('2024-01-15T00:00:00Z'),
                updated_at: new Date('2024-01-15T00:00:00Z')
            }

            const mockResponse = {
                data: mockExpense,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await ExpenseModel.findExpenseById(expenseId)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.select).toHaveBeenCalledWith('*')
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', expenseId)
            expect(result).toEqual(mockExpense)
        })

        it('应该在开销不存在时返回null', async () => {
            const expenseId = 'non-existent-expense'

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

            const result = await ExpenseModel.findExpenseById(expenseId)

            expect(result).toBeNull()
        })
    })

    describe('updateExpense', () => {
        it('应该成功更新开销', async () => {
            const expenseId = 'expense-123'
            const updateData: UpdateExpenseData = {
                title: '更新后的交通费用',
                amount: 150
            }

            const mockUpdatedExpense: ExpenseData = {
                id: expenseId,
                budget_id: 'budget-123',
                user_id: 'user-123',
                title: '更新后的交通费用',
                amount: 150,
                type: ExpenseType.TRANSPORTATION,
                expense_date: new Date('2024-01-15'),
                created_at: new Date('2024-01-15T00:00:00Z'),
                updated_at: new Date('2024-01-16T00:00:00Z')
            }

            const mockResponse = {
                data: mockUpdatedExpense,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue(mockResponse)
            }

            jest.spyOn(ExpenseModel, 'findExpenseById').mockResolvedValue(mockExpense)
            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'updateBudgetAmounts').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'checkAndUpdateBudgetStatus').mockResolvedValue()
                ; (databaseConnection as any) = mockSupabase

            const result = await ExpenseModel.updateExpense(expenseId, updateData)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.update).toHaveBeenCalledWith({
                ...updateData,
                updated_at: expect.any(Date)
            })
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', expenseId)
            expect(result).toEqual(mockResponse.data)
        })
    })

    describe('deleteExpense', () => {
        it('应该成功删除开销', async () => {
            const expenseId = 'expense-123'

            const mockResponse = {
                data: null,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis()
            }

            jest.spyOn(ExpenseModel, 'findExpenseById').mockResolvedValue(mockExpense)
            jest.spyOn(BudgetModel, 'findBudgetById').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'updateBudgetAmounts').mockResolvedValue(mockBudget)
            jest.spyOn(BudgetModel, 'checkAndUpdateBudgetStatus').mockResolvedValue()
                ; (databaseConnection as any) = mockSupabase

            await ExpenseModel.deleteExpense(expenseId)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.delete).toHaveBeenCalled()
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', expenseId)
        })
    })

    describe('listExpensesByBudget', () => {
        it('应该成功列出预算的开销', async () => {
            const budgetId = 'budget-123'
            const mockExpenses: ExpenseData[] = [
                {
                    id: 'expense-1',
                    budget_id: budgetId,
                    user_id: 'user-123',
                    amount: 100,
                    currency: 'CNY',
                    category: BudgetCategory.TRANSPORTATION,
                    type: ExpenseType.FIXED,
                    description: '交通费用',
                    date: new Date('2024-01-15'),
                    created_at: new Date('2024-01-15T00:00:00Z'),
                    updated_at: new Date('2024-01-15T00:00:00Z')
                },
                {
                    id: 'expense-2',
                    budget_id: budgetId,
                    user_id: 'user-123',
                    amount: 200,
                    currency: 'CNY',
                    category: BudgetCategory.ACCOMMODATION,
                    type: ExpenseType.FIXED,
                    description: '住宿费用',
                    date: new Date('2024-01-16'),
                    created_at: new Date('2024-01-16T00:00:00Z'),
                    updated_at: new Date('2024-01-16T00:00:00Z')
                }
            ]

            const mockResponse = {
                data: mockExpenses,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await ExpenseModel.listExpensesByBudget(budgetId)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.select).toHaveBeenCalledWith('*')
            expect(mockSupabase.eq).toHaveBeenCalledWith('budget_id', budgetId)
            expect(mockSupabase.order).toHaveBeenCalledWith('date', { ascending: false })
            expect(result).toEqual(mockExpenses)
        })
    })

    describe('listUserExpenses', () => {
        it('应该成功列出用户的开销', async () => {
            const userId = 'user-123'
            const mockExpenses: ExpenseData[] = [
                {
                    id: 'expense-1',
                    budget_id: 'budget-123',
                    user_id: userId,
                    amount: 100,
                    currency: 'CNY',
                    category: BudgetCategory.TRANSPORTATION,
                    type: ExpenseType.FIXED,
                    description: '交通费用',
                    date: new Date('2024-01-15'),
                    created_at: new Date('2024-01-15T00:00:00Z'),
                    updated_at: new Date('2024-01-15T00:00:00Z')
                }
            ]

            const mockResponse = {
                data: mockExpenses,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const result = await ExpenseModel.listUserExpenses(userId)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.select).toHaveBeenCalledWith('*')
            expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId)
            expect(mockSupabase.order).toHaveBeenCalledWith('date', { ascending: false })
            expect(result).toEqual(mockExpenses)
        })
    })

    describe('analyzeExpenseTrends', () => {
        it('应该正确分析开销趋势', async () => {
            const budgetId = 'budget-123'
            const mockExpenses: ExpenseData[] = [
                {
                    id: 'expense-1',
                    budget_id: budgetId,
                    user_id: 'user-123',
                    amount: 100,
                    currency: 'CNY',
                    category: BudgetCategory.TRANSPORTATION,
                    type: ExpenseType.FIXED,
                    description: '交通费用',
                    date: new Date('2024-01-15'),
                    created_at: new Date('2024-01-15T00:00:00Z'),
                    updated_at: new Date('2024-01-15T00:00:00Z')
                },
                {
                    id: 'expense-2',
                    budget_id: budgetId,
                    user_id: 'user-123',
                    amount: 200,
                    currency: 'CNY',
                    category: BudgetCategory.ACCOMMODATION,
                    type: ExpenseType.FIXED,
                    description: '住宿费用',
                    date: new Date('2024-01-16'),
                    created_at: new Date('2024-01-16T00:00:00Z'),
                    updated_at: new Date('2024-01-16T00:00:00Z')
                }
            ]

            const mockResponse = {
                data: mockExpenses,
                error: null
            }

            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue(mockResponse)
            }

                ; (databaseConnection as any) = mockSupabase

            const trends = await ExpenseModel.analyzeExpenseTrends(budgetId)

            expect(mockSupabase.from).toHaveBeenCalledWith('expenses')
            expect(mockSupabase.select).toHaveBeenCalledWith('*')
            expect(mockSupabase.eq).toHaveBeenCalledWith('budget_id', budgetId)
            expect(mockSupabase.order).toHaveBeenCalledWith('date', { ascending: false })
            expect(trends).toHaveLength(2)
            expect(trends[0].amount).toBe(200)
            expect(trends[0].count).toBe(1)
            expect(trends[1].amount).toBe(100)
            expect(trends[1].count).toBe(1)
        })
    })
})