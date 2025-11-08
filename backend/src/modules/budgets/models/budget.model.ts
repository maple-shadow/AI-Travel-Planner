import { databaseConnection } from '../../../core/database'
import { BudgetData, CreateBudgetData, UpdateBudgetData, BudgetStatus, BudgetCategory } from '../types/budget.types'

export class BudgetModel {
    private static tableName = 'budgets'

    // 创建预算
    static async createBudget(budgetData: CreateBudgetData): Promise<BudgetData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const budget: Omit<BudgetData, 'id' | 'created_at' | 'updated_at'> = {
            ...budgetData,
            used_amount: 0,
            currency: budgetData.currency || 'CNY',
            status: BudgetStatus.ACTIVE,
            category: budgetData.category || BudgetCategory.OTHER
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(budget)
            .select()
            .single()

        if (error) {
            throw new Error(`创建预算失败: ${error.message}`)
        }

        return data as BudgetData
    }

    // 根据ID查找预算
    static async findBudgetById(id: string): Promise<BudgetData | null> {
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
            throw new Error(`查找预算失败: ${error.message}`)
        }

        return data as BudgetData
    }

    // 根据行程ID查找预算
    static async findBudgetByTripId(tripId: string): Promise<BudgetData | null> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('trip_id', tripId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // 未找到记录
            }
            throw new Error(`根据行程查找预算失败: ${error.message}`)
        }

        return data as BudgetData
    }

    // 更新预算
    static async updateBudget(id: string, updateData: UpdateBudgetData): Promise<BudgetData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
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
            throw new Error(`更新预算失败: ${error.message}`)
        }

        return data as BudgetData
    }

    // 删除预算
    static async deleteBudget(id: string): Promise<boolean> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(`删除预算失败: ${error.message}`)
        }

        return true
    }

    // 更新预算金额
    static async updateBudgetAmounts(id: string, amounts: {
        used_amount?: number
        remaining_amount?: number
    }): Promise<BudgetData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...amounts,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw new Error(`更新预算金额失败: ${error.message}`)
        }

        return data as BudgetData
    }

    // 计算预算使用情况
    static calculateBudgetUsage(budget: BudgetData): {
        percentage: number
        remaining: number
        isOverBudget: boolean
    } {
        const percentage = budget.total_amount > 0
            ? (budget.used_amount / budget.total_amount) * 100
            : 0

        const remaining = budget.total_amount - budget.used_amount
        const isOverBudget = budget.used_amount > budget.total_amount

        return {
            percentage: Math.round(percentage * 100) / 100,
            remaining: Math.round(remaining * 100) / 100,
            isOverBudget
        }
    }

    // 列出用户预算
    static async listUserBudgets(userId: string, options?: {
        status?: BudgetStatus
        limit?: number
        offset?: number
    }): Promise<BudgetData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }

        if (options?.limit) {
            query = query.limit(options.limit)
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`获取用户预算列表失败: ${error.message}`)
        }

        return data as BudgetData[]
    }

    // 获取预算统计信息
    static async getBudgetStats(userId: string): Promise<{
        total_budgets: number
        active_budgets: number
        completed_budgets: number
        cancelled_budgets: number
        exceeded_budgets: number
        total_amount: number
        total_used_amount: number
        total_remaining_amount: number
        average_budget_amount: number
    }> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)

        if (error) {
            throw new Error(`获取预算统计信息失败: ${error.message}`)
        }

        const budgets = data as BudgetData[]
        const totalBudgets = budgets.length
        const activeBudgets = budgets.filter(b => b.status === BudgetStatus.ACTIVE).length
        const completedBudgets = budgets.filter(b => b.status === BudgetStatus.COMPLETED).length
        const cancelledBudgets = budgets.filter(b => b.status === BudgetStatus.CANCELLED).length
        const exceededBudgets = budgets.filter(b => b.status === BudgetStatus.OVER_BUDGET).length

        const totalAmount = budgets.reduce((sum, b) => sum + b.total_amount, 0)
        const totalUsed = budgets.reduce((sum, b) => sum + b.used_amount, 0)
        const totalRemaining = budgets.reduce((sum, b) => sum + (b.total_amount - b.used_amount), 0)
        const averageBudget = totalBudgets > 0 ? totalAmount / totalBudgets : 0

        return {
            total_budgets: totalBudgets,
            active_budgets: activeBudgets,
            completed_budgets: completedBudgets,
            cancelled_budgets: cancelledBudgets,
            exceeded_budgets: exceededBudgets,
            total_amount: totalAmount,
            total_used_amount: totalUsed,
            total_remaining_amount: totalRemaining,
            average_budget_amount: Math.round(averageBudget * 100) / 100
        }
    }

    // 检查预算状态并更新
    static async checkAndUpdateBudgetStatus(budgetId: string): Promise<BudgetData> {
        const budget = await this.findBudgetById(budgetId)
        if (!budget) {
            throw new Error('预算不存在')
        }

        let newStatus = budget.status

        // 如果已使用金额超过总金额，标记为超预算
        if (budget.used_amount > budget.total_amount && budget.status !== BudgetStatus.OVER_BUDGET) {
            newStatus = BudgetStatus.OVER_BUDGET
        }
        // 如果预算已完成且状态不是已完成，更新状态
        else if (budget.used_amount >= budget.total_amount && budget.status === BudgetStatus.ACTIVE) {
            newStatus = BudgetStatus.COMPLETED
        }

        if (newStatus !== budget.status) {
            return await this.updateBudget(budgetId, { status: newStatus })
        }

        return budget
    }
}

export default BudgetModel