// 预算管理API服务
import { api } from '../../../services/api-client'
import {
    BudgetData,
    CreateBudgetData,
    UpdateBudgetData,
    ExpenseData,
    CreateExpenseData,
    UpdateExpenseData,
    BudgetStats,
    ExpenseStats,
    ExpenseTrends,
    BudgetReport,
    ApiResponse
} from '../types'

const BUDGETS_BASE_URL = '/budgets'

// 预算服务类
export class BudgetService {
    // 创建预算
    static async createBudget(budgetData: CreateBudgetData): Promise<ApiResponse<BudgetData>> {
        try {
            const response = await api.post(BUDGETS_BASE_URL, budgetData)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '创建预算失败'
            }
        }
    }

    // 获取预算详情
    static async getBudgetById(id: string): Promise<ApiResponse<BudgetData>> {
        try {
            const response = await api.get(`${BUDGETS_BASE_URL}/${id}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取预算详情失败'
            }
        }
    }

    // 更新预算
    static async updateBudget(id: string, updateData: UpdateBudgetData): Promise<ApiResponse<BudgetData>> {
        try {
            const response = await api.put(`${BUDGETS_BASE_URL}/${id}`, updateData)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '更新预算失败'
            }
        }
    }

    // 删除预算
    static async deleteBudget(id: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await api.delete(`${BUDGETS_BASE_URL}/${id}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '删除预算失败'
            }
        }
    }

    // 添加开销
    static async addExpense(expenseData: CreateExpenseData): Promise<ApiResponse<ExpenseData>> {
        try {
            console.log('=== BudgetService.addExpense 开始 ===')
            console.log('发送的开销数据:', JSON.stringify(expenseData, null, 2))
            console.log('API端点:', `${BUDGETS_BASE_URL}/expenses`)

            const response = await api.post(`${BUDGETS_BASE_URL}/expenses`, expenseData)

            console.log('API响应:', JSON.stringify(response.data, null, 2))
            console.log('=== BudgetService.addExpense 结束 ===')

            return response
        } catch (error: any) {
            console.error('BudgetService.addExpense 错误:', error)
            console.error('错误响应数据:', error.response?.data)
            console.error('错误状态码:', error.response?.status)

            return {
                success: false,
                error: error.response?.data?.error || '添加开销失败'
            }
        }
    }

    // 更新开销
    static async updateExpense(id: string, updateData: UpdateExpenseData): Promise<ApiResponse<ExpenseData>> {
        try {
            const response = await api.put(`${BUDGETS_BASE_URL}/expenses/${id}`, updateData)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '更新开销失败'
            }
        }
    }

    // 删除开销
    static async deleteExpense(id: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await api.delete(`${BUDGETS_BASE_URL}/expenses/${id}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '删除开销失败'
            }
        }
    }

    // 获取预算使用情况
    static async getBudgetUsage(budgetId: string): Promise<ApiResponse<any>> {
        try {
            const response = await api.get(`${BUDGETS_BASE_URL}/${budgetId}/usage`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取预算使用情况失败'
            }
        }
    }

    // 获取预算统计信息
    static async getBudgetStats(): Promise<ApiResponse<BudgetStats>> {
        try {
            const response = await api.get(`${BUDGETS_BASE_URL}/stats`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取预算统计信息失败'
            }
        }
    }

    // 获取开销统计信息
    static async getExpenseStats(budgetId: string): Promise<ApiResponse<ExpenseStats>> {
        try {
            const response = await api.get(`${BUDGETS_BASE_URL}/${budgetId}/expenses/stats`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取开销统计信息失败'
            }
        }
    }

    // 分析开销趋势
    static async analyzeExpenseTrends(
        budgetId: string,
        period: 'daily' | 'weekly' | 'monthly' = 'monthly'
    ): Promise<ApiResponse<ExpenseTrends>> {
        try {
            const response = await api.get(`${BUDGETS_BASE_URL}/${budgetId}/trends?period=${period}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '分析开销趋势失败'
            }
        }
    }

    // 生成预算分析报告
    static async generateBudgetReport(budgetId: string): Promise<ApiResponse<BudgetReport>> {
        try {
            const response = await api.get(`${BUDGETS_BASE_URL}/${budgetId}/report`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '生成预算分析报告失败'
            }
        }
    }

    // 列出用户预算
    static async listUserBudgets(userId: string, options?: {
        status?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<BudgetData[]>> {
        try {
            const params = new URLSearchParams()
            params.append('user_id', userId)
            if (options?.status) params.append('status', options.status)
            if (options?.limit) params.append('limit', options.limit.toString())
            if (options?.offset) params.append('offset', options.offset.toString())

            const response = await api.get(`${BUDGETS_BASE_URL}/?${params.toString()}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取用户预算列表失败'
            }
        }
    }

    // 列出预算开销
    static async listBudgetExpenses(budgetId: string, options?: {
        category?: string
        type?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<ExpenseData[]>> {
        try {
            const params = new URLSearchParams()
            if (options?.category) params.append('category', options.category)
            if (options?.type) params.append('type', options.type)
            if (options?.limit) params.append('limit', options.limit.toString())
            if (options?.offset) params.append('offset', options.offset.toString())

            const response = await api.get(`${BUDGETS_BASE_URL}/${budgetId}/expenses?${params.toString()}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取预算开销列表失败'
            }
        }
    }

    // 列出用户开销
    static async listUserExpenses(options?: {
        budget_id?: string
        category?: string
        type?: string
        expense_date_from?: string
        expense_date_to?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<ExpenseData[]>> {
        try {
            const params = new URLSearchParams()
            if (options?.budget_id) params.append('budget_id', options.budget_id)
            if (options?.category) params.append('category', options.category)
            if (options?.type) params.append('type', options.type)
            if (options?.expense_date_from) params.append('expense_date_from', options.expense_date_from)
            if (options?.expense_date_to) params.append('expense_date_to', options.expense_date_to)
            if (options?.limit) params.append('limit', options.limit.toString())
            if (options?.offset) params.append('offset', options.offset.toString())

            const response = await api.get(`${BUDGETS_BASE_URL}/expenses/user?${params.toString()}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取用户开销列表失败'
            }
        }
    }
}

export default BudgetService