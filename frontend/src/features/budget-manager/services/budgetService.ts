// 预算管理API服务
import axios from 'axios'
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

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 创建axios实例
const budgetApi = axios.create({
    baseURL: `${API_BASE_URL}/budgets`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 添加认证token
budgetApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 处理错误
budgetApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 认证失败，跳转到登录页
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// 预算服务类
export class BudgetService {
    // 创建预算
    static async createBudget(budgetData: CreateBudgetData): Promise<ApiResponse<BudgetData>> {
        try {
            const response = await budgetApi.post('/', budgetData)
            return response.data
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
            const response = await budgetApi.get(`/${id}`)
            return response.data
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
            const response = await budgetApi.put(`/${id}`, updateData)
            return response.data
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
            const response = await budgetApi.delete(`/${id}`)
            return response.data
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
            const response = await budgetApi.post('/expenses', expenseData)
            return response.data
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '添加开销失败'
            }
        }
    }

    // 更新开销
    static async updateExpense(id: string, updateData: UpdateExpenseData): Promise<ApiResponse<ExpenseData>> {
        try {
            const response = await budgetApi.put(`/expenses/${id}`, updateData)
            return response.data
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
            const response = await budgetApi.delete(`/expenses/${id}`)
            return response.data
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
            const response = await budgetApi.get(`/${budgetId}/usage`)
            return response.data
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
            const response = await budgetApi.get('/stats')
            return response.data
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
            const response = await budgetApi.get(`/${budgetId}/expenses/stats`)
            return response.data
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
            const response = await budgetApi.get(`/${budgetId}/trends?period=${period}`)
            return response.data
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
            const response = await budgetApi.get(`/${budgetId}/report`)
            return response.data
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
            if (options?.status) params.append('status', options.status)
            if (options?.limit) params.append('limit', options.limit.toString())
            if (options?.offset) params.append('offset', options.offset.toString())

            const response = await budgetApi.get(`/user/${userId}?${params.toString()}`)
            return response.data
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

            const response = await budgetApi.get(`/${budgetId}/expenses?${params.toString()}`)
            return response.data
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
        date_from?: string
        date_to?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<ExpenseData[]>> {
        try {
            const params = new URLSearchParams()
            if (options?.budget_id) params.append('budget_id', options.budget_id)
            if (options?.category) params.append('category', options.category)
            if (options?.type) params.append('type', options.type)
            if (options?.date_from) params.append('date_from', options.date_from)
            if (options?.date_to) params.append('date_to', options.date_to)
            if (options?.limit) params.append('limit', options.limit.toString())
            if (options?.offset) params.append('offset', options.offset.toString())

            const response = await budgetApi.get(`/expenses/user?${params.toString()}`)
            return response.data
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || '获取用户开销列表失败'
            }
        }
    }
}

export default BudgetService