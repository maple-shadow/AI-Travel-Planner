import { databaseConnection } from '../../../core/database'
import { ExpenseData, CreateExpenseData, UpdateExpenseData, ExpenseType, BudgetCategory } from '../types/budget.types'
import { BudgetModel } from './budget.model'

export class ExpenseModel {
    private static tableName = 'expenses'

    // 添加开销
    static async addExpense(expenseData: CreateExpenseData): Promise<ExpenseData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        // 检查预算是否存在
        const budget = await BudgetModel.findBudgetById(expenseData.budget_id)
        if (!budget) {
            throw new Error('预算不存在')
        }

        const expense: Omit<ExpenseData, 'id' | 'created_at' | 'updated_at'> = {
            ...expenseData,
            currency: expenseData.currency || 'CNY',
            type: expenseData.type || ExpenseType.VARIABLE
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(expense)
            .select()
            .single()

        if (error) {
            throw new Error(`添加开销失败: ${error.message}`)
        }

        // 更新预算金额
        const newUsedAmount = budget.used_amount + expenseData.amount
        const newRemainingAmount = Math.max(0, budget.total_amount - newUsedAmount)

        await BudgetModel.updateBudgetAmounts(budget.id!, {
            used_amount: newUsedAmount,
            remaining_amount: newRemainingAmount
        })

        // 检查并更新预算状态
        await BudgetModel.checkAndUpdateBudgetStatus(budget.id!)

        return data as ExpenseData
    }

    // 根据ID查找开销
    static async findExpenseById(id: string): Promise<ExpenseData | null> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // 未找到记录
            }
            throw new Error(`查找开销失败: ${error.message}`)
        }

        return data as ExpenseData
    }

    // 更新开销
    static async updateExpense(id: string, updateData: UpdateExpenseData): Promise<ExpenseData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const expense = await this.findExpenseById(id)
        if (!expense) {
            throw new Error('开销不存在')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...updateData,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw new Error(`更新开销失败: ${error.message}`)
        }

        // 如果金额有变化，更新预算金额
        if (updateData.amount !== undefined && updateData.amount !== expense.amount) {
            const budget = await BudgetModel.findBudgetById(expense.budget_id)
            if (budget) {
                const amountDiff = updateData.amount - expense.amount
                const newUsedAmount = budget.used_amount + amountDiff
                const newRemainingAmount = Math.max(0, budget.total_amount - newUsedAmount)

                await BudgetModel.updateBudgetAmounts(budget.id!, {
                    used_amount: newUsedAmount,
                    remaining_amount: newRemainingAmount
                })

                // 检查并更新预算状态
                await BudgetModel.checkAndUpdateBudgetStatus(budget.id!)
            }
        }

        return data as ExpenseData
    }

    // 删除开销
    static async deleteExpense(id: string): Promise<boolean> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const expense = await this.findExpenseById(id)
        if (!expense) {
            throw new Error('开销不存在')
        }

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(`删除开销失败: ${error.message}`)
        }

        // 更新预算金额
        const budget = await BudgetModel.findBudgetById(expense.budget_id)
        if (budget) {
            const newUsedAmount = budget.used_amount - expense.amount
            const newRemainingAmount = Math.max(0, budget.total_amount - newUsedAmount)

            await BudgetModel.updateBudgetAmounts(budget.id!, {
                used_amount: newUsedAmount,
                remaining_amount: newRemainingAmount
            })

            // 检查并更新预算状态
            await BudgetModel.checkAndUpdateBudgetStatus(budget.id!)
        }

        return true
    }

    // 列出预算的开销
    static async listExpensesByBudget(budgetId: string, options?: {
        category?: BudgetCategory
        type?: ExpenseType
        limit?: number
        offset?: number
    }): Promise<ExpenseData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('budget_id', budgetId)
            .order('date', { ascending: false })

        if (options?.category) {
            query = query.eq('category', options.category)
        }

        if (options?.type) {
            query = query.eq('type', options.type)
        }

        if (options?.limit) {
            query = query.limit(options.limit)
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`获取开销列表失败: ${error.message}`)
        }

        return data as ExpenseData[]
    }

    // 列出用户的开销
    static async listUserExpenses(userId: string, options?: {
        budget_id?: string
        category?: BudgetCategory
        type?: ExpenseType
        date_from?: Date
        date_to?: Date
        limit?: number
        offset?: number
    }): Promise<ExpenseData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })

        if (options?.budget_id) {
            query = query.eq('budget_id', options.budget_id)
        }

        if (options?.category) {
            query = query.eq('category', options.category)
        }

        if (options?.type) {
            query = query.eq('type', options.type)
        }

        if (options?.date_from) {
            query = query.gte('date', options.date_from.toISOString())
        }

        if (options?.date_to) {
            query = query.lte('date', options.date_to.toISOString())
        }

        if (options?.limit) {
            query = query.limit(options.limit)
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`获取用户开销列表失败: ${error.message}`)
        }

        return data as ExpenseData[]
    }

    // 分析开销趋势
    static async analyzeExpenseTrends(budgetId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<Array<{
        period: string
        amount: number
        count: number
    }>> {
        const expenses = await this.listExpensesByBudget(budgetId)

        const trends: Record<string, { amount: number; count: number }> = {}

        expenses.forEach(expense => {
            const date = new Date(expense.date)
            let periodKey: string

            switch (period) {
                case 'daily':
                    periodKey = date.toISOString().split('T')[0] || date.toISOString()
                    break
                case 'weekly':
                    const weekStart = new Date(date)
                    weekStart.setDate(date.getDate() - date.getDay())
                    periodKey = weekStart.toISOString().split('T')[0] || weekStart.toISOString()
                    break
                case 'monthly':
                    periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                    break
                default:
                    periodKey = date.toISOString()
                    break
            }

            if (!trends[periodKey]) {
                trends[periodKey] = { amount: 0, count: 0 }
            }

            const trend = trends[periodKey]
            if (trend) {
                trend.amount += expense.amount
                trend.count += 1
            }
        })

        return Object.entries(trends).map(([period, data]) => ({
            period,
            amount: data.amount,
            count: data.count
        })).sort((a, b) => a.period.localeCompare(b.period))
    }

    // 获取开销统计信息
    static async getExpenseStats(budgetId: string): Promise<{
        total_expenses: number
        total_amount: number
        average_expense: number
        category_distribution: Record<BudgetCategory, number>
        type_distribution: Record<ExpenseType, number>
        daily_average: number
        monthly_average: number
    }> {
        const expenses = await this.listExpensesByBudget(budgetId)

        const totalExpenses = expenses.length
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0

        const categoryDistribution: Record<BudgetCategory, number> = {} as Record<BudgetCategory, number>
        const typeDistribution: Record<ExpenseType, number> = {} as Record<ExpenseType, number>

        // 初始化分类分布
        Object.values(BudgetCategory).forEach(category => {
            categoryDistribution[category] = 0
        })

        // 初始化类型分布
        Object.values(ExpenseType).forEach(type => {
            typeDistribution[type] = 0
        })

        // 计算分布
        expenses.forEach(expense => {
            categoryDistribution[expense.category] += expense.amount
            typeDistribution[expense.type] += expense.amount
        })

        // 计算日均和月均开销
        const budget = await BudgetModel.findBudgetById(budgetId)
        let dailyAverage = 0
        let monthlyAverage = 0

        if (budget && expenses.length > 0) {
            const startDate = new Date(budget.start_date)
            const endDate = new Date(budget.end_date)
            const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

            dailyAverage = totalAmount / totalDays
            monthlyAverage = dailyAverage * 30
        }

        return {
            total_expenses: totalExpenses,
            total_amount: totalAmount,
            average_expense: Math.round(averageExpense * 100) / 100,
            category_distribution: categoryDistribution,
            type_distribution: typeDistribution,
            daily_average: Math.round(dailyAverage * 100) / 100,
            monthly_average: Math.round(monthlyAverage * 100) / 100
        }
    }
}

export default ExpenseModel