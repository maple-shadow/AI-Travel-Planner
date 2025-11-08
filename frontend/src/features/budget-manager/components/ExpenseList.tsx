// 开销列表组件
import React from 'react'
import { ExpenseData, ExpenseType } from '../types'

interface ExpenseListProps {
    expenses: ExpenseData[]
    onEditExpense: (expense: ExpenseData) => void
    onDeleteExpense: (expense: ExpenseData) => void
    showBudgetName?: boolean
}

const ExpenseList: React.FC<ExpenseListProps> = ({
    expenses,
    onEditExpense,
    onDeleteExpense,
    showBudgetName = false
}) => {
    // 获取开销类型样式
    const getTypeStyle = (type: ExpenseType) => {
        switch (type) {
            case ExpenseType.INCOME:
                return 'bg-green-100 text-green-800'
            case ExpenseType.EXPENSE:
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // 获取开销类型图标
    const getTypeIcon = (type: ExpenseType) => {
        switch (type) {
            case ExpenseType.INCOME:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case ExpenseType.EXPENSE:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
        }
    }

    // 获取金额显示样式
    const getAmountStyle = (type: ExpenseType, amount: number) => {
        const baseStyle = "text-lg font-semibold"
        if (type === ExpenseType.INCOME) {
            return `${baseStyle} text-green-600`
        }
        return `${baseStyle} text-red-600`
    }

    // 获取金额前缀
    const getAmountPrefix = (type: ExpenseType) => {
        return type === ExpenseType.INCOME ? '+' : '-'
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无开销记录</h3>
                <p className="mt-1 text-sm text-gray-500">开始记录您的第一笔开销吧！</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <div
                    key={expense.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(expense.type)}`}>
                                        {getTypeIcon(expense.type)}
                                        <span className="ml-1">{expense.type === ExpenseType.INCOME ? '收入' : '支出'}</span>
                                    </span>
                                    {showBudgetName && expense.budget_name && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {expense.budget_name}
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-base font-medium text-gray-900">{expense.description}</h4>

                                {expense.category && (
                                    <p className="text-sm text-gray-600 mt-1">分类: {expense.category}</p>
                                )}

                                {expense.note && (
                                    <p className="text-sm text-gray-500 mt-1">{expense.note}</p>
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEditExpense(expense)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                    title="编辑开销"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDeleteExpense(expense)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded"
                                    title="删除开销"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className={getAmountStyle(expense.type, expense.amount)}>
                                {getAmountPrefix(expense.type)}¥{expense.amount.toLocaleString()}
                            </div>

                            <div className="text-sm text-gray-500">
                                {expense.expense_date && new Date(expense.expense_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ExpenseList