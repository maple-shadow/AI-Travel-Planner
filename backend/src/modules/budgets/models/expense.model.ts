import { databaseConnection } from '../../../core/database'
import { ExpenseData, CreateExpenseData, UpdateExpenseData, ExpenseType, BudgetCategory } from '../types/budget.types'
import { BudgetModel } from './budget.model'

export class ExpenseModel {
    private static tableName = 'expenses'

    // 检查开销表是否存在，如果不存在则创建
    static async ensureTableExists(): Promise<void> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        try {
            // 尝试执行一个简单的查询来检查表是否存在
            const { data, error } = await supabase
                .from(this.tableName)
                .select('count')
                .limit(1)

            if (error) {
                // 如果表不存在（任何错误都可能是表不存在），尝试创建表
                console.log('开销表不存在，正在创建表...')
                await this.createTable()
                console.log('开销表创建成功')
            } else {
                console.log('开销表已存在')
            }
        } catch (error) {
            console.warn('开销表检查异常:', error)
            // 即使有异常，也尝试创建表
            console.log('尝试创建开销表...')
            await this.createTable()
        }
    }

    // 创建开销表
    private static async createTable(): Promise<void> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        // 使用SQL语句创建表
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS expenses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (type IN ('transportation', 'accommodation', 'food', 'entertainment', 'shopping', 'other')),
                amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
                currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
                expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
                location VARCHAR(255),
                receipt_url TEXT,
                tags TEXT[],
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                
                -- 约束：开销日期不能晚于当前日期
                CONSTRAINT expense_date_check CHECK (expense_date <= CURRENT_DATE)
            );

            -- 创建索引
            CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
            CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
            CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
            CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
            CREATE INDEX IF NOT EXISTS idx_expenses_tags ON expenses USING GIN(tags);

            -- 启用行级安全
            ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

            -- 创建策略：用户只能访问自己的开销
            CREATE POLICY "用户只能访问自己的开销" ON expenses
                FOR ALL USING (auth.uid() = user_id);

            -- 创建更新触发器
            CREATE OR REPLACE FUNCTION update_expenses_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trigger_update_expenses_updated_at
                BEFORE UPDATE ON expenses
                FOR EACH ROW
                EXECUTE FUNCTION update_expenses_updated_at();
        `

        console.warn('⚠️ 开销表不存在，需要手动创建。')
        console.warn('📋 请按照以下步骤在Supabase控制台创建表:')
        console.warn('1. 访问您的Supabase项目: https://ttzirvzwfmynayvruuho.supabase.co')
        console.warn('2. 使用您的GitHub账户登录')
        console.warn('3. 点击左侧菜单的 "SQL Editor"')
        console.warn('4. 复制并执行以下SQL语句:')
        console.warn('')
        console.warn(createTableSQL)
        console.warn('')
        console.warn('5. 或者使用 "Table Editor" 手动创建:')
        console.warn('   - 点击左侧菜单的 "Table Editor"')
        console.warn('   - 点击 "Create a new table"')
        console.warn('   - 表名: expenses')
        console.warn('   - 添加以下字段:')
        console.warn('     • id (uuid, primary key)')
        console.warn('     • budget_id (uuid, foreign key to budgets.id)')
        console.warn('     • user_id (uuid, foreign key to users.id)')
        console.warn('     • title (varchar(255))')
        console.warn('     • description (text)')
        console.warn('     • type (varchar(50))')
        console.warn('     • amount (decimal)')
        console.warn('     • currency (varchar(3))')
        console.warn('     • expense_date (date)')
        console.warn('     • location (varchar(255))')
        console.warn('     • receipt_url (text)')
        console.warn('     • tags (text array)')
        console.warn('     • created_at (timestamp)')
        console.warn('     • updated_at (timestamp)')
        console.warn('')
        console.warn('🔧 创建完成后，重启应用即可正常使用开销功能。')

        // 抛出明确的错误，让调用方知道需要手动干预
        throw new Error('开销表不存在，请按照控制台输出在Supabase中手动创建表')
    }

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
            .order('expense_date', { ascending: false })

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
            .order('expense_date', { ascending: false })

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
            query = query.gte('expense_date', options.date_from.toISOString())
        }

        if (options?.date_to) {
            query = query.lte('expense_date', options.date_to.toISOString())
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
            const date = new Date(expense.expense_date)
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