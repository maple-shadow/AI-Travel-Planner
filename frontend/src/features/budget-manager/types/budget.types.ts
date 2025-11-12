// 预算相关类型定义

// 预算状态枚举
export enum BudgetStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    OVER_BUDGET = 'over_budget'
}

// 预算分类枚举
export enum BudgetCategory {
    TRAVEL = 'travel',
    TRANSPORTATION = 'transportation',
    ACCOMMODATION = 'accommodation',
    FOOD = 'food',
    ENTERTAINMENT = 'entertainment',
    ACTIVITIES = 'activities',
    SHOPPING = 'shopping',
    OTHER = 'other'
}

// 开销类型枚举
export enum ExpenseType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

// 预算数据接口
export interface BudgetData {
    id: string
    user_id: string
    trip_id?: string
    title: string
    description?: string
    total_amount: number
    used_amount: number
    remaining_amount: number
    currency: string
    category: BudgetCategory
    status: BudgetStatus
    start_date?: string
    end_date?: string
    created_at: string
    updated_at: string
}

// 创建预算数据接口
export interface CreateBudgetData {
    trip_id: string
    user_id: string
    title: string
    description?: string
    total_amount: number
    currency?: string
    category?: BudgetCategory
    start_date?: string
    end_date?: string
}

// 更新预算数据接口
export interface UpdateBudgetData {
    title?: string
    description?: string
    total_amount?: number
    currency?: string
    category?: BudgetCategory
    status?: BudgetStatus
    start_date?: string
    end_date?: string
}

// 开销数据接口
export interface ExpenseData {
    id: string
    user_id: string
    budget_id: string
    title: string
    description?: string
    amount: number
    currency: string
    category: BudgetCategory
    type: ExpenseType
    expense_date: string
    location?: string
    created_at: string
    updated_at: string
}

// 创建开销数据接口
export interface CreateExpenseData {
    budget_id: string
    user_id: string
    title: string
    description?: string
    amount: number
    currency?: string
    category?: BudgetCategory
    type?: ExpenseType
    expense_date?: string
    location?: string
}

// 更新开销数据接口
export interface UpdateExpenseData {
    title?: string
    description?: string
    amount?: number
    currency?: string
    category?: BudgetCategory
    type?: ExpenseType
    expense_date?: string
    location?: string
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
    total_expense_amount?: number
    total_income_amount?: number
    average_expense_amount: number
    category_breakdown: Record<string, number>
    category_stats?: Record<string, number>
    monthly_stats?: Record<string, number>
    daily_average: number
    monthly_average: number
}

// 开销趋势分析接口
export interface ExpenseTrends {
    period: 'daily' | 'weekly' | 'monthly'
    data: Array<{
        date: string
        amount: number
        count: number
    }>
    total_amount: number
    average_amount: number
    trend_direction: 'up' | 'down' | 'stable'
}

// 预算分析报告接口
export interface BudgetReport {
    budget: BudgetData
    usage: BudgetUsage
    expenses: ExpenseData[]
    stats: ExpenseStats
    trends: ExpenseTrends
    recommendations: string[]
}

// API响应接口
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    errors?: string[]
}

// 预算表单数据接口
export interface BudgetFormData {
    title: string
    description: string
    total_amount: number
    currency: string
    category: BudgetCategory
    start_date: string
    end_date: string
}

// 开销表单数据接口
export interface ExpenseFormData {
    title: string
    description: string
    amount: number
    currency: string
    category: BudgetCategory
    type: ExpenseType
    date: string
    location: string
}

// 预算分析参数接口
export interface BudgetAnalysisParams {
    budget_id: string
    period?: 'daily' | 'weekly' | 'monthly'
    date_from?: string
    date_to?: string
}

// 预算提醒接口
export interface BudgetAlert {
    id: string
    budget_id: string
    type: 'warning' | 'danger' | 'info'
    title: string
    message: string
    threshold?: number
    is_read: boolean
    created_at: string
}