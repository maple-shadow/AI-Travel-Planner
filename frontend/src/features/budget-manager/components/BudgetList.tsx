// 预算列表组件
import React from 'react'
import { BudgetData, BudgetStatus } from '../types'
import { useBudget } from '../hooks'

interface BudgetListProps {
    budgets: BudgetData[]
    onSelectBudget: (budget: BudgetData) => void
    onEditBudget: (budget: BudgetData) => void
    onDeleteBudget: (budget: BudgetData) => void
}

const BudgetList: React.FC<BudgetListProps> = ({
    budgets,
    onSelectBudget,
    onEditBudget,
    onDeleteBudget
}) => {
    const { loading, error } = useBudget()

    // 获取预算状态样式
    const getStatusStyle = (status: BudgetStatus) => {
        switch (status) {
            case BudgetStatus.ACTIVE:
                return 'bg-green-100 text-green-800'
            case BudgetStatus.INACTIVE:
                return 'bg-gray-100 text-gray-800'
            case BudgetStatus.COMPLETED:
                return 'bg-blue-100 text-blue-800'
            case BudgetStatus.OVER_BUDGET:
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // 计算预算使用率
    const calculateUsageRate = (budget: BudgetData) => {
        if (!budget.total_amount || budget.total_amount === 0) return 0
        return ((budget.used_amount || 0) / budget.total_amount) * 100
    }

    // 获取使用率颜色
    const getUsageColor = (usageRate: number) => {
        if (usageRate >= 100) return 'bg-red-500'
        if (usageRate >= 80) return 'bg-orange-500'
        if (usageRate >= 60) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700">{error}</span>
                </div>
            </div>
        )
    }

    if (budgets.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无预算</h3>
                <p className="mt-1 text-sm text-gray-500">开始创建您的第一个预算吧！</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {budgets.map((budget) => {
                const usageRate = calculateUsageRate(budget)

                return (
                    <div
                        key={budget.id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                        onClick={() => onSelectBudget(budget)}>
                                        {budget.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{budget.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEditBudget(budget)}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                        title="编辑预算"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDeleteBudget(budget)}
                                        className="text-red-600 hover:text-red-800 p-1 rounded"
                                        title="删除预算"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <span className="text-sm text-gray-500">总预算</span>
                                    <p className="text-lg font-semibold">¥{budget.total_amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">已使用</span>
                                    <p className="text-lg font-semibold">¥{(budget.used_amount || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* 使用率进度条 */}
                            <div className="mb-3">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>使用率</span>
                                    <span>{usageRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getUsageColor(usageRate)} transition-all duration-300`}
                                        style={{ width: `${Math.min(usageRate, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(budget.status)}`}>
                                    {budget.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {budget.start_date && new Date(budget.start_date).toLocaleDateString()}
                                    {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString()}`}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default BudgetList