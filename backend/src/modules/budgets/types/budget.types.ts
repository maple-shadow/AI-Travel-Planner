// 预算分类枚举
export enum BudgetCategory {
    TRANSPORTATION = 'transportation',  // 交通
    ACCOMMODATION = 'accommodation',   // 住宿
    FOOD = 'food',                     // 餐饮
    ACTIVITIES = 'activities',         // 活动
    SHOPPING = 'shopping',             // 购物
    EMERGENCY = 'emergency',           // 应急
    OTHER = 'other'                    // 其他
}

// 开销类型枚举
export enum ExpenseType {
    FIXED = 'fixed',                   // 固定开销
    VARIABLE = 'variable',             // 可变开销
    ONE_TIME = 'one_time',             // 一次性开销
    RECURRING = 'recurring'            // 周期性开销
}

// 预算状态枚举
export enum BudgetStatus {
    ACTIVE = 'active',                 // 活跃
    COMPLETED = 'completed',           // 已完成
    CANCELLED = 'cancelled',           // 已取消
    OVER_BUDGET = 'over_budget'        // 超预算
}

// 预算数据接口
export interface BudgetData {
    id?: string
    trip_id: string
    user_id: string
    total_amount: number
    used_amount: number
    currency: string
    status: BudgetStatus
    category: BudgetCategory
    start_date: Date
    end_date: Date
    notes?: string
    created_at?: Date
    updated_at?: Date
}

// 开销数据接口
export interface ExpenseData {
    id?: string
    budget_id: string
    user_id: string
    amount: number
    currency: string
    category: BudgetCategory
    type: ExpenseType
    description: string
    date: Date
    location?: string
    receipt_url?: string
    tags?: string[]
    created_at?: Date
    updated_at?: Date
}

// 预算创建数据接口
export interface CreateBudgetData {
    trip_id: string
    user_id: string
    total_amount: number
    currency?: string
    category?: BudgetCategory
    start_date: Date
    end_date: Date
    notes?: string
}

// 开销创建数据接口
export interface CreateExpenseData {
    budget_id: string
    user_id: string
    amount: number
    currency?: string
    category: BudgetCategory
    type?: ExpenseType
    description: string
    date: Date
    location?: string
    receipt_url?: string
    tags?: string[]
}

// 预算更新数据接口
export interface UpdateBudgetData {
    total_amount?: number
    currency?: string
    status?: BudgetStatus
    category?: BudgetCategory
    start_date?: Date
    end_date?: Date
    notes?: string
}

// 开销更新数据接口
export interface UpdateExpenseData {
    amount?: number
    currency?: string
    category?: BudgetCategory
    type?: ExpenseType
    description?: string
    date?: Date
    location?: string
    receipt_url?: string
    tags?: string[]
}

// 预算查询条件接口
export interface BudgetQueryOptions {
    trip_id?: string
    user_id?: string
    status?: BudgetStatus
    category?: BudgetCategory
    start_date_from?: Date
    start_date_to?: Date
    end_date_from?: Date
    end_date_to?: Date
    min_amount?: number
    max_amount?: number
    limit?: number
    offset?: number
    sort_by?: 'created_at' | 'start_date' | 'total_amount' | 'status'
    sort_order?: 'asc' | 'desc'
}

// 开销查询条件接口
export interface ExpenseQueryOptions {
    budget_id?: string
    user_id?: string
    category?: BudgetCategory
    type?: ExpenseType
    date_from?: Date
    date_to?: Date
    min_amount?: number
    max_amount?: number
    tags?: string[]
    limit?: number
    offset?: number
    sort_by?: 'date' | 'amount' | 'category' | 'created_at'
    sort_order?: 'asc' | 'desc'
}

// 预算使用情况接口
export interface BudgetUsage {
    percentage: number
    remaining: number
    isOverBudget: boolean
}

// 预算统计信息接口
export interface BudgetStats {
    total_budgets: number
    active_budgets: number
    completed_budgets: number
    cancelled_budgets: number
    exceeded_budgets: number
    total_amount: number
    total_used_amount: number
    total_remaining_amount: number
    average_budget_amount: number
}

// 开销统计信息接口
export interface ExpenseStats {
    total_expenses: number
    total_amount: number
    average_expense: number
    category_distribution: Record<BudgetCategory, number>
    type_distribution: Record<ExpenseType, number>
    daily_average: number
    monthly_average: number
}

// 开销趋势数据接口
export interface ExpenseTrends {
    period: string
    amount: number
    count: number
}

// 预算分析报告接口
export interface BudgetAnalysisReport {
    budget_id: string
    trip_id: string
    budget_status: BudgetStatus
    total_budget: number
    total_expenses: number
    remaining_budget: number
    usage_percentage: number
    daily_spending_rate: number
    projected_end_balance: number
    category_breakdown: Record<BudgetCategory, {
        allocated: number
        spent: number
        remaining: number
        percentage: number
    }>
    expense_trends: {
        daily: Array<{ date: string; amount: number }>
        weekly: Array<{ week: string; amount: number }>
        monthly: Array<{ month: string; amount: number }>
    }
    alerts: Array<{
        type: 'over_budget' | 'high_spending' | 'low_balance' | 'unusual_expense'
        message: string
        severity: 'low' | 'medium' | 'high'
    }>
}

// 预算验证错误接口
export interface BudgetValidationError {
    field: string
    message: string
    code: string
}

// 预算操作结果接口
export interface BudgetOperationResult {
    success: boolean
    data?: BudgetData | ExpenseData | BudgetData[] | ExpenseData[] | BudgetStats | ExpenseStats | BudgetAnalysisReport | ExpenseTrends[] | BudgetUsage
    error?: string
    validationErrors?: BudgetValidationError[]
}

// 预算列表响应接口
export interface BudgetListResponse {
    budgets: BudgetData[]
    total_count: number
    current_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

// 开销列表响应接口
export interface ExpenseListResponse {
    expenses: ExpenseData[]
    total_count: number
    current_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
    total_amount: number
}

// 默认导出
export default {
    BudgetCategory,
    ExpenseType,
    BudgetStatus
}