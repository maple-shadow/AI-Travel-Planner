import { databaseConnection } from '../../../core/database'
import { BudgetData, CreateBudgetData, UpdateBudgetData, BudgetStatus, BudgetCategory } from '../types/budget.types'

export class BudgetModel {
    private static tableName = 'budgets'

    // 检查预算表是否存在，如果不存在则创建
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
                console.log('预算表不存在，正在创建表...')
                await this.createTable()
                console.log('预算表创建成功')
            } else {
                console.log('预算表已存在')
                // 检查表结构是否完整，特别是notes列是否存在
                await this.ensureTableStructure()
            }
        } catch (error) {
            console.warn('预算表检查异常:', error)
            // 即使有异常，也尝试创建表
            console.log('尝试创建预算表...')
            await this.createTable()
        }
    }

    // 检查表结构是否完整，确保所有必需的列都存在
    private static async ensureTableStructure(): Promise<void> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        try {
            // 尝试查询notes列来检查它是否存在
            const { data, error } = await supabase
                .from(this.tableName)
                .select('notes')
                .limit(1)

            if (error && error.message.includes('notes')) {
                console.log('检测到表结构不完整，缺少notes列，正在添加...')
                await this.addMissingColumns()
            } else {
                console.log('表结构完整，所有必需的列都存在')
            }
        } catch (error) {
            console.warn('表结构检查异常:', error)
        }
    }

    // 添加缺失的列
    private static async addMissingColumns(): Promise<void> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        try {
            // 添加notes列的SQL语句
            const alterTableSQL = `
                ALTER TABLE budgets ADD COLUMN IF NOT EXISTS notes TEXT;
            `

            console.warn('⚠️ 检测到表结构不完整，需要手动添加缺失的列。')
            console.warn('📋 请按照以下步骤在Supabase控制台添加notes列:')
            console.warn('1. 访问您的Supabase项目: https://ttzirvzwfmynayvruuho.supabase.co')
            console.warn('2. 使用您的GitHub账户登录')
            console.warn('3. 点击左侧菜单的 "SQL Editor"')
            console.warn('4. 复制并执行以下SQL语句:')
            console.warn('')
            console.warn(alterTableSQL)
            console.warn('')
            console.warn('5. 或者使用 "Table Editor" 手动添加:')
            console.warn('   - 点击左侧菜单的 "Table Editor"')
            console.warn('   - 选择 "budgets" 表')
            console.warn('   - 点击 "Add column"')
            console.warn('   - 列名: notes')
            console.warn('   - 类型: text')
            console.warn('   - 点击 "Save"')
            console.warn('')
            console.warn('🔧 添加完成后，重启应用即可正常使用预算功能。')

            // 不抛出错误，而是继续启动，让用户手动添加列
            console.warn('⚠️ 表结构不完整，但应用将继续启动。请按照上述步骤添加notes列。')
        } catch (error) {
            console.error('添加缺失列失败:', error)
            // 不抛出错误，让应用继续启动
            console.warn('⚠️ 表结构检查失败，但应用将继续启动。')
        }
    }

    // 创建预算表
    private static async createTable(): Promise<void> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        // 使用SQL语句创建表
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS budgets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                notes TEXT,
                category VARCHAR(50) NOT NULL DEFAULT 'general',
                total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
                used_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (used_amount >= 0),
                currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
                status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'exceeded')),
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                
                -- 约束：已用金额不能超过总金额
                CONSTRAINT used_amount_check CHECK (used_amount <= total_amount),
                -- 约束：结束日期必须大于开始日期
                CONSTRAINT date_check CHECK (end_date >= start_date)
            );

            -- 创建索引
            CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
            CREATE INDEX IF NOT EXISTS idx_budgets_trip_id ON budgets(trip_id);
            CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
            CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
            CREATE INDEX IF NOT EXISTS idx_budgets_dates ON budgets(start_date, end_date);

            -- 启用行级安全
            ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

            -- 创建策略：用户只能访问自己的预算
            CREATE POLICY "用户只能访问自己的预算" ON budgets
                FOR ALL USING (auth.uid() = user_id);

            -- 创建更新触发器
            CREATE OR REPLACE FUNCTION update_budgets_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trigger_update_budgets_updated_at
                BEFORE UPDATE ON budgets
                FOR EACH ROW
                EXECUTE FUNCTION update_budgets_updated_at();
        `

        console.warn('⚠️ 预算表不存在，需要手动创建。')
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
        console.warn('   - 表名: budgets')
        console.warn('   - 添加以下字段:')
        console.warn('     • id (uuid, primary key)')
        console.warn('     • user_id (uuid, foreign key to users.id)')
        console.warn('     • trip_id (uuid, foreign key to trips.id)')
        console.warn('     • title (varchar(255))')
        console.warn('     • description (text)')
        console.warn('     • notes (text)')
        console.warn('     • category (varchar(50))')
        console.warn('     • total_amount (decimal)')
        console.warn('     • used_amount (decimal)')
        console.warn('     • currency (varchar(3))')
        console.warn('     • status (varchar(20))')
        console.warn('     • start_date (date)')
        console.warn('     • end_date (date)')
        console.warn('     • created_at (timestamp)')
        console.warn('     • updated_at (timestamp)')
        console.warn('')
        console.warn('🔧 创建完成后，重启应用即可正常使用预算功能。')

        // 抛出明确的错误，让调用方知道需要手动干预
        throw new Error('预算表不存在，请按照控制台输出在Supabase中手动创建表')
    }

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

        console.log('📝 准备创建预算数据:', JSON.stringify(budget, null, 2))

        try {
            // 使用服务端密钥绕过RLS限制
            const { data, error } = await supabase
                .from(this.tableName)
                .insert(budget)
                .select()
                .single()

            if (error) {
                console.error('❌ 创建预算失败 - Supabase错误:', error)

                // 如果是RLS错误，提供更详细的解决方案
                if (error.message.includes('row-level security policy')) {
                    console.warn('⚠️ RLS策略错误，需要检查Supabase配置:')
                    console.warn('1. 确保budgets表的RLS策略允许服务端操作')
                    console.warn('2. 或者为服务端操作创建专门的策略')
                    console.warn('3. 检查user_id字段是否正确设置')
                }

                throw new Error(`创建预算失败: ${error.message}`)
            }

            console.log('✅ 预算创建成功:', data)
            return data as BudgetData
        } catch (error) {
            console.error('❌ 创建预算异常:', error)
            throw error
        }
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
            console.error('❌ 数据库连接未初始化')
            throw new Error('数据库连接未初始化')
        }

        console.log(`🔍 预算模型开始查询用户 ${userId} 的预算数据`)
        console.log('📋 查询选项:', JSON.stringify(options || {}, null, 2))

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        console.log('📊 构建基础查询: 按用户ID过滤，按创建时间降序排序')

        if (options?.status) {
            query = query.eq('status', options.status)
            console.log(`📋 添加状态过滤: ${options.status}`)
        }

        if (options?.limit) {
            query = query.limit(options.limit)
            console.log(`📋 添加限制数量: ${options.limit}`)
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
            console.log(`📋 添加偏移量: ${options.offset}`)
        }

        console.log('🚀 执行数据库查询...')
        const { data, error } = await query

        if (error) {
            console.error('❌ 数据库查询失败:', error)
            console.error('📋 错误详情:', JSON.stringify(error, null, 2))
            throw new Error(`获取用户预算列表失败: ${error.message}`)
        }

        console.log(`✅ 数据库查询成功，返回 ${Array.isArray(data) ? data.length : 0} 条记录`)
        if (Array.isArray(data) && data.length > 0) {
            console.log('📄 查询结果示例:', JSON.stringify(data.slice(0, 2), null, 2))
        } else {
            console.warn('⚠️ 查询结果为空，未找到匹配的预算记录')
            console.log('🔍 可能的原因:')
            console.log('   - 用户ID不存在或格式不正确')
            console.log('   - 该用户尚未创建任何预算')
            console.log('   - 查询条件过于严格')
            console.log('   - 数据库表不存在或结构不匹配')
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