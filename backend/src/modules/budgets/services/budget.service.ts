import { BudgetModel } from '../models/budget.model'
import { ExpenseModel } from '../models/expense.model'
import { BudgetValidators } from '../validators/budget.validators'
import {
    CreateBudgetData,
    UpdateBudgetData,
    CreateExpenseData,
    UpdateExpenseData,
    BudgetOperationResult,
    BudgetStats,
    ExpenseStats,
    BudgetAnalysisReport,
    BudgetCategory,
    ExpenseType,
    BudgetStatus
} from '../types/budget.types'

export class BudgetService {
    // 创建预算
    static async createBudget(budgetData: CreateBudgetData): Promise<BudgetOperationResult> {
        try {
            // 验证数据
            const validationErrors = BudgetValidators.validateCreateBudget(budgetData)
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            // 检查是否已存在该行程的预算
            const existingBudget = await BudgetModel.findBudgetByTripId(budgetData.trip_id)
            if (existingBudget) {
                return {
                    success: false,
                    error: '该行程已存在预算'
                }
            }

            const budget = await BudgetModel.createBudget(budgetData)

            return {
                success: true,
                data: budget
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '创建预算失败'
            }
        }
    }

    // 获取预算详情
    static async getBudgetById(id: string): Promise<BudgetOperationResult> {
        try {
            const budget = await BudgetModel.findBudgetById(id)
            if (!budget) {
                return {
                    success: false,
                    error: '预算不存在'
                }
            }

            return {
                success: true,
                data: budget
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取预算详情失败'
            }
        }
    }

    // 更新预算
    static async updateBudget(id: string, updateData: UpdateBudgetData): Promise<BudgetOperationResult> {
        try {
            // 验证数据
            const validationErrors = BudgetValidators.validateUpdateBudget(updateData)
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            const budget = await BudgetModel.updateBudget(id, updateData)

            return {
                success: true,
                data: budget
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '更新预算失败'
            }
        }
    }

    // 删除预算
    static async deleteBudget(id: string): Promise<BudgetOperationResult> {
        try {
            // 检查预算是否存在
            const budget = await BudgetModel.findBudgetById(id)
            if (!budget) {
                return {
                    success: false,
                    error: '预算不存在'
                }
            }

            // 删除预算相关的所有开销
            const expenses = await ExpenseModel.listExpensesByBudget(id)
            for (const expense of expenses) {
                await ExpenseModel.deleteExpense(expense.id!)
            }

            await BudgetModel.deleteBudget(id)

            return {
                success: true
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '删除预算失败'
            }
        }
    }

    // 添加开销
    static async addExpense(expenseData: CreateExpenseData): Promise<BudgetOperationResult> {
        try {
            // 验证数据
            const validationErrors = BudgetValidators.validateCreateExpense(expenseData)
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            const expense = await ExpenseModel.addExpense(expenseData)

            return {
                success: true,
                data: expense
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '添加开销失败'
            }
        }
    }

    // 更新开销
    static async updateExpense(id: string, updateData: UpdateExpenseData): Promise<BudgetOperationResult> {
        try {
            // 验证数据
            const validationErrors = BudgetValidators.validateUpdateExpense(updateData)
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            const expense = await ExpenseModel.updateExpense(id, updateData)

            return {
                success: true,
                data: expense
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '更新开销失败'
            }
        }
    }

    // 删除开销
    static async deleteExpense(id: string): Promise<BudgetOperationResult> {
        try {
            // 检查开销是否存在
            const expense = await ExpenseModel.findExpenseById(id)
            if (!expense) {
                return {
                    success: false,
                    error: '开销不存在'
                }
            }

            await ExpenseModel.deleteExpense(id)

            return {
                success: true
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '删除开销失败'
            }
        }
    }

    // 获取预算使用情况
    static async getBudgetUsage(budgetId: string): Promise<BudgetOperationResult> {
        try {
            const budget = await BudgetModel.findBudgetById(budgetId)
            if (!budget) {
                return {
                    success: false,
                    error: '预算不存在'
                }
            }

            const usage = BudgetModel.calculateBudgetUsage(budget)

            return {
                success: true,
                data: usage
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取预算使用情况失败'
            }
        }
    }

    // 获取预算统计信息
    static async getBudgetStats(userId: string): Promise<BudgetOperationResult> {
        try {
            const stats = await BudgetModel.getBudgetStats(userId)

            return {
                success: true,
                data: stats
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取预算统计信息失败'
            }
        }
    }

    // 获取开销统计信息
    static async getExpenseStats(budgetId: string): Promise<BudgetOperationResult> {
        try {
            const stats = await ExpenseModel.getExpenseStats(budgetId)

            return {
                success: true,
                data: stats
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取开销统计信息失败'
            }
        }
    }

    // 分析开销趋势
    static async analyzeExpenseTrends(budgetId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<BudgetOperationResult> {
        try {
            const trends = await ExpenseModel.analyzeExpenseTrends(budgetId, period)

            return {
                success: true,
                data: trends
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '分析开销趋势失败'
            }
        }
    }

    // 生成预算分析报告
    static async generateBudgetReport(budgetId: string): Promise<BudgetOperationResult> {
        try {
            const budget = await BudgetModel.findBudgetById(budgetId)
            if (!budget) {
                return {
                    success: false,
                    error: '预算不存在'
                }
            }

            const usage = BudgetModel.calculateBudgetUsage(budget)
            const expenseStats = await ExpenseModel.getExpenseStats(budgetId)
            const dailyTrends = await ExpenseModel.analyzeExpenseTrends(budgetId, 'daily')
            const weeklyTrends = await ExpenseModel.analyzeExpenseTrends(budgetId, 'weekly')
            const monthlyTrends = await ExpenseModel.analyzeExpenseTrends(budgetId, 'monthly')

            // 计算预计结束余额
            const startDate = new Date(budget.start_date)
            const endDate = new Date(budget.end_date)
            const today = new Date()
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            const dailySpendingRate = daysPassed > 0 ? budget.used_amount / daysPassed : 0
            const projectedEndBalance = budget.total_amount - (dailySpendingRate * totalDays)

            // 计算剩余预算
            const remainingBudget = budget.total_amount - budget.used_amount

            // 生成分类细分
            const categoryBreakdown: Record<string, { allocated: number; spent: number; remaining: number; percentage: number }> = {}
            Object.entries(expenseStats.category_distribution).forEach(([category, spent]) => {
                const allocated = budget.total_amount * 0.1 // 假设每个分类分配10%的预算
                const remaining = Math.max(0, allocated - spent)
                const percentage = allocated > 0 ? (spent / allocated) * 100 : 0

                categoryBreakdown[category] = {
                    allocated,
                    spent,
                    remaining,
                    percentage: Math.round(percentage * 100) / 100
                }
            })

            // 生成警报
            const alerts: Array<{ type: 'over_budget' | 'high_spending' | 'low_balance' | 'unusual_expense'; message: string; severity: 'low' | 'medium' | 'high' }> = []

            if (budget.used_amount > budget.total_amount) {
                alerts.push({
                    type: 'over_budget',
                    message: '预算已超支',
                    severity: 'high'
                })
            }

            if (usage.percentage > 80) {
                alerts.push({
                    type: 'high_spending',
                    message: '预算使用率超过80%',
                    severity: 'medium'
                })
            }

            if (remainingBudget < budget.total_amount * 0.1) {
                alerts.push({
                    type: 'low_balance',
                    message: '剩余预算不足10%',
                    severity: 'medium'
                })
            }

            const report: BudgetAnalysisReport = {
                budget_id: budgetId,
                trip_id: budget.trip_id,
                budget_status: budget.status,
                total_budget: budget.total_amount,
                total_expenses: budget.used_amount,
                remaining_budget: budget.total_amount - budget.used_amount,
                usage_percentage: usage.percentage,
                daily_spending_rate: Math.round(dailySpendingRate * 100) / 100,
                projected_end_balance: Math.round(projectedEndBalance * 100) / 100,
                category_breakdown: categoryBreakdown,
                expense_trends: {
                    daily: dailyTrends.map(trend => ({ date: trend.period, amount: trend.amount })),
                    weekly: weeklyTrends.map(trend => ({ week: trend.period, amount: trend.amount })),
                    monthly: monthlyTrends.map(trend => ({ month: trend.period, amount: trend.amount }))
                },
                alerts
            }

            return {
                success: true,
                data: report
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '生成预算分析报告失败'
            }
        }
    }

    // 列出用户预算
    static async listUserBudgets(userId: string, options?: {
        status?: BudgetStatus
        limit?: number
        offset?: number
    }): Promise<BudgetOperationResult> {
        try {
            // 验证查询参数
            const validationErrors = BudgetValidators.validateBudgetQuery(options || {})
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            const budgets = await BudgetModel.listUserBudgets(userId, options)

            return {
                success: true,
                data: budgets
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取用户预算列表失败'
            }
        }
    }

    // 列出预算开销
    static async listBudgetExpenses(budgetId: string, options?: {
        category?: BudgetCategory
        type?: ExpenseType
        limit?: number
        offset?: number
    }): Promise<BudgetOperationResult> {
        try {
            // 验证查询参数
            const validationErrors = BudgetValidators.validateExpenseQuery(options || {})
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            const expenses = await ExpenseModel.listExpensesByBudget(budgetId, options)

            return {
                success: true,
                data: expenses
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取预算开销列表失败'
            }
        }
    }

    // 列出用户开销
    static async listUserExpenses(userId: string, options?: {
        budget_id?: string
        category?: BudgetCategory
        type?: ExpenseType
        date_from?: Date
        date_to?: Date
        limit?: number
        offset?: number
    }): Promise<BudgetOperationResult> {
        try {
            // 验证查询参数
            const validationErrors = BudgetValidators.validateExpenseQuery(options || {})
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    validationErrors
                }
            }

            const expenses = await ExpenseModel.listUserExpenses(userId, options)

            return {
                success: true,
                data: expenses
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取用户开销列表失败'
            }
        }
    }
}

export default BudgetService