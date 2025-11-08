// 预算管理自定义Hooks
import { useState, useEffect, useCallback } from 'react'
import { BudgetService } from '../services'
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

// 预算状态接口
interface BudgetState {
    budgets: BudgetData[]
    currentBudget: BudgetData | null
    expenses: ExpenseData[]
    loading: boolean
    error: string | null
}

// 使用预算管理的Hook
export const useBudget = () => {
    const [state, setState] = useState<BudgetState>({
        budgets: [],
        currentBudget: null,
        expenses: [],
        loading: false,
        error: null
    })

    // 设置错误
    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error, loading: false }))
    }, [])

    // 设置加载状态
    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, loading, error: null }))
    }, [])

    // 创建预算
    const createBudget = useCallback(async (budgetData: CreateBudgetData): Promise<ApiResponse<BudgetData>> => {
        setLoading(true)
        try {
            const result = await BudgetService.createBudget(budgetData)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    budgets: [...prev.budgets, result.data!],
                    loading: false
                }))
            } else {
                setError(result.error || '创建预算失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '创建预算时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 获取预算详情
    const getBudgetById = useCallback(async (id: string): Promise<ApiResponse<BudgetData>> => {
        setLoading(true)
        try {
            const result = await BudgetService.getBudgetById(id)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    currentBudget: result.data!,
                    loading: false
                }))
            } else {
                setError(result.error || '获取预算详情失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取预算详情时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 更新预算
    const updateBudget = useCallback(async (id: string, updateData: UpdateBudgetData): Promise<ApiResponse<BudgetData>> => {
        setLoading(true)
        try {
            const result = await BudgetService.updateBudget(id, updateData)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    budgets: prev.budgets.map(budget =>
                        budget.id === id ? result.data! : budget
                    ),
                    currentBudget: prev.currentBudget?.id === id ? result.data! : prev.currentBudget,
                    loading: false
                }))
            } else {
                setError(result.error || '更新预算失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '更新预算时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 删除预算
    const deleteBudget = useCallback(async (id: string): Promise<ApiResponse<boolean>> => {
        setLoading(true)
        try {
            const result = await BudgetService.deleteBudget(id)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    budgets: prev.budgets.filter(budget => budget.id !== id),
                    currentBudget: prev.currentBudget?.id === id ? null : prev.currentBudget,
                    loading: false
                }))
            } else {
                setError(result.error || '删除预算失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '删除预算时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 添加开销
    const addExpense = useCallback(async (expenseData: CreateExpenseData): Promise<ApiResponse<ExpenseData>> => {
        setLoading(true)
        try {
            const result = await BudgetService.addExpense(expenseData)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    expenses: [...prev.expenses, result.data!],
                    loading: false
                }))
            } else {
                setError(result.error || '添加开销失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '添加开销时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 更新开销
    const updateExpense = useCallback(async (id: string, updateData: UpdateExpenseData): Promise<ApiResponse<ExpenseData>> => {
        setLoading(true)
        try {
            const result = await BudgetService.updateExpense(id, updateData)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    expenses: prev.expenses.map(expense =>
                        expense.id === id ? result.data! : expense
                    ),
                    loading: false
                }))
            } else {
                setError(result.error || '更新开销失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '更新开销时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 删除开销
    const deleteExpense = useCallback(async (id: string): Promise<ApiResponse<boolean>> => {
        setLoading(true)
        try {
            const result = await BudgetService.deleteExpense(id)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    expenses: prev.expenses.filter(expense => expense.id !== id),
                    loading: false
                }))
            } else {
                setError(result.error || '删除开销失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '删除开销时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 获取预算使用情况
    const getBudgetUsage = useCallback(async (budgetId: string): Promise<ApiResponse<any>> => {
        setLoading(true)
        try {
            const result = await BudgetService.getBudgetUsage(budgetId)
            setLoading(false)
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取预算使用情况时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 获取预算统计信息
    const getBudgetStats = useCallback(async (): Promise<ApiResponse<BudgetStats>> => {
        setLoading(true)
        try {
            const result = await BudgetService.getBudgetStats()
            setLoading(false)
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取预算统计信息时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 获取开销统计信息
    const getExpenseStats = useCallback(async (budgetId: string): Promise<ApiResponse<ExpenseStats>> => {
        setLoading(true)
        try {
            const result = await BudgetService.getExpenseStats(budgetId)
            setLoading(false)
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取开销统计信息时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 分析开销趋势
    const analyzeExpenseTrends = useCallback(async (
        budgetId: string,
        period: 'daily' | 'weekly' | 'monthly' = 'monthly'
    ): Promise<ApiResponse<ExpenseTrends>> => {
        setLoading(true)
        try {
            const result = await BudgetService.analyzeExpenseTrends(budgetId, period)
            setLoading(false)
            return result
        } catch (error: any) {
            const errorMsg = error.message || '分析开销趋势时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 生成预算分析报告
    const generateBudgetReport = useCallback(async (budgetId: string): Promise<ApiResponse<BudgetReport>> => {
        setLoading(true)
        try {
            const result = await BudgetService.generateBudgetReport(budgetId)
            setLoading(false)
            return result
        } catch (error: any) {
            const errorMsg = error.message || '生成预算分析报告时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 列出用户预算
    const listUserBudgets = useCallback(async (userId: string, options?: {
        status?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<BudgetData[]>> => {
        setLoading(true)
        try {
            const result = await BudgetService.listUserBudgets(userId, options)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    budgets: result.data!,
                    loading: false
                }))
            } else {
                setError(result.error || '获取用户预算列表失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取用户预算列表时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 列出预算开销
    const listBudgetExpenses = useCallback(async (budgetId: string, options?: {
        category?: string
        type?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<ExpenseData[]>> => {
        setLoading(true)
        try {
            const result = await BudgetService.listBudgetExpenses(budgetId, options)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    expenses: result.data!,
                    loading: false
                }))
            } else {
                setError(result.error || '获取预算开销列表失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取预算开销列表时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 列出用户开销
    const listUserExpenses = useCallback(async (options?: {
        budget_id?: string
        category?: string
        type?: string
        date_from?: string
        date_to?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<ExpenseData[]>> => {
        setLoading(true)
        try {
            const result = await BudgetService.listUserExpenses(options)
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    expenses: result.data!,
                    loading: false
                }))
            } else {
                setError(result.error || '获取用户开销列表失败')
            }
            return result
        } catch (error: any) {
            const errorMsg = error.message || '获取用户开销列表时发生错误'
            setError(errorMsg)
            return { success: false, error: errorMsg }
        }
    }, [setLoading, setError])

    // 清除错误
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    // 清除当前预算
    const clearCurrentBudget = useCallback(() => {
        setState(prev => ({ ...prev, currentBudget: null }))
    }, [])

    // 清除开销列表
    const clearExpenses = useCallback(() => {
        setState(prev => ({ ...prev, expenses: [] }))
    }, [])

    return {
        // 状态
        ...state,

        // 操作方法
        createBudget,
        getBudgetById,
        updateBudget,
        deleteBudget,
        addExpense,
        updateExpense,
        deleteExpense,
        getBudgetUsage,
        getBudgetStats,
        getExpenseStats,
        analyzeExpenseTrends,
        generateBudgetReport,
        listUserBudgets,
        listBudgetExpenses,
        listUserExpenses,

        // 清除方法
        clearError,
        clearCurrentBudget,
        clearExpenses,

        // 设置方法
        setLoading,
        setError
    }
}

// 使用预算统计的Hook
export const useBudgetStats = () => {
    const [stats, setStats] = useState<BudgetStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await BudgetService.getBudgetStats()
            if (result.success && result.data) {
                setStats(result.data)
            } else {
                setError(result.error || '获取统计信息失败')
            }
        } catch (error: any) {
            setError(error.message || '获取统计信息时发生错误')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return { stats, loading, error, refetch: fetchStats }
}

// 使用开销趋势分析的Hook
export const useExpenseTrends = (budgetId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
    const [trends, setTrends] = useState<ExpenseTrends | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTrends = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await BudgetService.analyzeExpenseTrends(budgetId, period)
            if (result.success && result.data) {
                setTrends(result.data)
            } else {
                setError(result.error || '获取趋势分析失败')
            }
        } catch (error: any) {
            setError(error.message || '获取趋势分析时发生错误')
        } finally {
            setLoading(false)
        }
    }, [budgetId, period])

    useEffect(() => {
        if (budgetId) {
            fetchTrends()
        }
    }, [budgetId, period, fetchTrends])

    return { trends, loading, error, refetch: fetchTrends }
}