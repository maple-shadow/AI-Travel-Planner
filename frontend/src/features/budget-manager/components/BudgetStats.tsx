// 预算统计组件
import React from 'react'
import { BudgetStats as BudgetStatsType, ExpenseStats } from '../types'

interface BudgetStatsProps {
    budgetStats?: BudgetStatsType | null
    expenseStats?: ExpenseStats | null
    loading?: boolean
}

const BudgetStats: React.FC<BudgetStatsProps> = ({
    budgetStats,
    expenseStats,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!budgetStats) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无统计数据</h3>
                <p className="mt-1 text-sm text-gray-500">开始使用预算管理功能后，这里将显示统计信息</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 总体统计 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 总预算数 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">总预算数</p>
                            <p className="text-2xl font-semibold text-gray-900">{budgetStats.total_budgets}</p>
                        </div>
                    </div>
                </div>

                {/* 活跃预算 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">活跃预算</p>
                            <p className="text-2xl font-semibold text-gray-900">{budgetStats.active_budgets}</p>
                        </div>
                    </div>
                </div>

                {/* 总预算金额 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">总预算金额</p>
                            <p className="text-2xl font-semibold text-gray-900">¥{budgetStats.total_amount?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* 已使用金额 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">已使用金额</p>
                            <p className="text-2xl font-semibold text-gray-900">¥{budgetStats.total_used_amount?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 开销统计 */}
            {expenseStats && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">开销统计</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 总开销数 */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">总开销数</p>
                            <p className="text-2xl font-semibold text-gray-900">{expenseStats.total_expenses}</p>
                        </div>

                        {/* 总支出 */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">总支出</p>
                            <p className="text-2xl font-semibold text-red-600">¥{expenseStats.total_expense_amount?.toLocaleString()}</p>
                        </div>

                        {/* 总收入 */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">总收入</p>
                            <p className="text-2xl font-semibold text-green-600">¥{expenseStats.total_income_amount?.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* 开销分类统计 */}
                    {expenseStats.category_stats && Object.keys(expenseStats.category_stats).length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-medium text-gray-700 mb-3">分类统计</h4>
                            <div className="space-y-2">
                                {Object.entries(expenseStats.category_stats).map(([category, amount]) => (
                                    <div key={category} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{category}</span>
                                        <span className="text-sm font-medium text-gray-900">¥{amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 月度开销趋势 */}
                    {expenseStats.monthly_stats && Object.keys(expenseStats.monthly_stats).length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-medium text-gray-700 mb-3">月度开销趋势</h4>
                            <div className="space-y-2">
                                {Object.entries(expenseStats.monthly_stats)
                                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                                    .slice(-6) // 显示最近6个月
                                    .map(([month, amount]) => (
                                        <div key={month} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{new Date(month).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}</span>
                                            <span className="text-sm font-medium text-gray-900">¥{amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}


        </div>
    )
}

export default BudgetStats