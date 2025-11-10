// 预算管理主页面
import React, { useState, useEffect } from 'react'
import { BudgetData, ExpenseData, CreateBudgetData, UpdateBudgetData, CreateExpenseData, UpdateExpenseData } from '../types'
import { useBudget, useBudgetStats } from '../hooks'
import { BudgetList, BudgetForm, ExpenseList, ExpenseForm, BudgetStats } from '../components'

const BudgetManagerPage: React.FC = () => {
    // 状态管理
    const [currentView, setCurrentView] = useState<'overview' | 'budget-detail' | 'create-budget' | 'edit-budget' | 'create-expense' | 'edit-expense'>('overview')
    const [selectedBudget, setSelectedBudget] = useState<BudgetData | null>(null)
    const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null)

    // 使用Hooks
    const budgetHook = useBudget()
    const statsHook = useBudgetStats()

    // 获取当前用户ID（这里需要从认证系统获取）
    const currentUserId = 'current-user-id' // 实际项目中应该从认证上下文获取

    // 加载用户预算列表
    useEffect(() => {
        if (currentUserId) {
            budgetHook.listUserBudgets(currentUserId)
        }
    }, [currentUserId])

    // 加载预算详情和开销列表
    useEffect(() => {
        if (selectedBudget?.id) {
            budgetHook.getBudgetById(selectedBudget.id)
            budgetHook.listBudgetExpenses(selectedBudget.id)
        }
    }, [selectedBudget?.id])

    // 处理创建预算
    const handleCreateBudget = async (budgetData: CreateBudgetData) => {
        const result = await budgetHook.createBudget({
            ...budgetData,
            user_id: currentUserId
        })

        if (result.success) {
            setCurrentView('overview')
            // 刷新统计信息
            statsHook.refetch()
        }
    }

    // 处理更新预算
    const handleUpdateBudget = async (budgetData: UpdateBudgetData) => {
        if (!selectedBudget?.id) return

        const result = await budgetHook.updateBudget(selectedBudget.id, budgetData)

        if (result.success) {
            setCurrentView('budget-detail')
            // 刷新统计信息
            statsHook.refetch()
        }
    }

    // 处理删除预算
    const handleDeleteBudget = async (budget: BudgetData) => {
        if (window.confirm(`确定要删除预算"${budget.title}"吗？此操作不可撤销。`)) {
            const result = await budgetHook.deleteBudget(budget.id)

            if (result.success) {
                if (selectedBudget?.id === budget.id) {
                    setSelectedBudget(null)
                    setCurrentView('overview')
                }
                // 刷新统计信息
                statsHook.refetch()
            }
        }
    }

    // 处理创建开销
    const handleCreateExpense = async (expenseData: CreateExpenseData) => {
        if (!selectedBudget?.id) return

        const result = await budgetHook.addExpense({
            ...expenseData,
            budget_id: selectedBudget.id,
            user_id: currentUserId
        })

        if (result.success) {
            // 刷新预算详情和开销列表
            budgetHook.getBudgetById(selectedBudget.id)
            budgetHook.listBudgetExpenses(selectedBudget.id)
        }
    }

    // 处理更新开销
    const handleUpdateExpense = async (expenseData: UpdateExpenseData) => {
        if (!selectedExpense?.id) return

        const result = await budgetHook.updateExpense(selectedExpense.id, expenseData)

        if (result.success) {
            setSelectedExpense(null)
            // 刷新开销列表
            if (selectedBudget?.id) {
                budgetHook.listBudgetExpenses(selectedBudget.id)
            }
        }
    }

    // 处理删除开销
    const handleDeleteExpense = async (expense: ExpenseData) => {
        if (window.confirm(`确定要删除这笔开销记录吗？此操作不可撤销。`)) {
            const result = await budgetHook.deleteExpense(expense.id)

            if (result.success) {
                // 刷新预算详情和开销列表
                if (selectedBudget?.id) {
                    budgetHook.getBudgetById(selectedBudget.id)
                    budgetHook.listBudgetExpenses(selectedBudget.id)
                }
            }
        }
    }

    // 导航处理
    const handleViewBudgetDetail = (budget: BudgetData) => {
        setSelectedBudget(budget)
        setCurrentView('budget-detail')
    }

    const handleEditBudget = (budget: BudgetData) => {
        setSelectedBudget(budget)
        setCurrentView('edit-budget')
    }

    const handleEditExpense = (expense: ExpenseData) => {
        setSelectedExpense(expense)
        setCurrentView('edit-expense')
    }

    const handleBackToOverview = () => {
        setSelectedBudget(null)
        setCurrentView('overview')
    }

    const handleCreateNewBudget = () => {
        setSelectedBudget(null)
        setCurrentView('create-budget')
    }

    const handleCreateNewExpense = () => {
        setSelectedExpense(null)
        setCurrentView('create-expense')
    }

    // 渲染页面内容
    const renderContent = () => {
        switch (currentView) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* 统计信息 */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">预算概览</h2>
                            <BudgetStats
                                budgetStats={statsHook.stats}
                                loading={statsHook.loading}
                            />
                        </div>

                        {/* 预算列表 */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">我的预算</h3>
                                <button
                                    onClick={handleCreateNewBudget}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    创建新预算
                                </button>
                            </div>
                            <BudgetList
                                budgets={budgetHook.budgets}
                                onSelectBudget={handleViewBudgetDetail}
                                onEditBudget={handleEditBudget}
                                onDeleteBudget={handleDeleteBudget}
                            />
                        </div>
                    </div>
                )

            case 'budget-detail':
                if (!selectedBudget) return null

                return (
                    <div className="space-y-6">
                        {/* 预算详情头部 */}
                        <div className="flex items-center justify-between">
                            <div>
                                <button
                                    onClick={handleBackToOverview}
                                    className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    返回概览
                                </button>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedBudget.title}</h2>
                                {selectedBudget.description && (
                                    <p className="text-gray-600 mt-1">{selectedBudget.description}</p>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditBudget(selectedBudget)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    编辑预算
                                </button>
                                <button
                                    onClick={handleCreateNewExpense}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    记录开销
                                </button>
                            </div>
                        </div>

                        {/* 预算基本信息 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">总预算</p>
                                    <p className="text-2xl font-bold text-gray-900">¥{selectedBudget.total_amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">已使用</p>
                                    <p className="text-2xl font-bold text-gray-900">¥{(selectedBudget.used_amount || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">剩余</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ¥{((selectedBudget.total_amount || 0) - (selectedBudget.used_amount || 0)).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 开销列表 */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">开销记录</h3>
                            <ExpenseList
                                expenses={budgetHook.expenses}
                                onEditExpense={handleEditExpense}
                                onDeleteExpense={handleDeleteExpense}
                            />
                        </div>
                    </div>
                )

            case 'create-budget':
            case 'edit-budget':
                return (
                    <div>
                        <button
                            onClick={() => {
                                setCurrentView(currentView === 'create-budget' ? 'overview' : 'budget-detail')
                            }}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            返回
                        </button>
                        <BudgetForm
                            budget={currentView === 'edit-budget' ? selectedBudget : undefined}
                            onSubmit={async (data) => {
                                if (currentView === 'edit-budget') {
                                    await handleUpdateBudget(data as UpdateBudgetData)
                                } else {
                                    await handleCreateBudget(data as CreateBudgetData)
                                }
                            }}
                            onCancel={() => {
                                setCurrentView(currentView === 'create-budget' ? 'overview' : 'budget-detail')
                            }}
                            loading={budgetHook.loading}
                        />
                    </div>
                )

            case 'create-expense':
            case 'edit-expense':
                return (
                    <div>
                        <button
                            onClick={() => {
                                setCurrentView('budget-detail')
                            }}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            返回预算详情
                        </button>
                        <ExpenseForm
                            expense={currentView === 'edit-expense' ? selectedExpense : undefined}
                            budgets={budgetHook.budgets}
                            onSubmit={async (data) => {
                                if (currentView === 'edit-expense') {
                                    await handleUpdateExpense(data as UpdateExpenseData)
                                } else {
                                    await handleCreateExpense(data as CreateExpenseData)
                                }
                            }}
                            onCancel={() => {
                                setCurrentView('budget-detail')
                            }}
                            loading={budgetHook.loading}
                        />
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">预算管理</h1>
                    <p className="text-gray-600 mt-2">管理您的旅行预算和开销记录</p>
                </div>

                {/* 错误提示 */}
                {budgetHook.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700">{budgetHook.error}</span>
                            <button
                                onClick={budgetHook.clearError}
                                className="ml-auto text-red-600 hover:text-red-800"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* 主要内容 */}
                {renderContent()}
            </div>
        </div>
    )
}

export default BudgetManagerPage