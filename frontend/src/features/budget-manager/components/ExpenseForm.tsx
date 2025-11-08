// 开销表单组件
import React, { useState, useEffect } from 'react'
import { ExpenseData, CreateExpenseData, UpdateExpenseData, ExpenseType, BudgetData } from '../types'

interface ExpenseFormProps {
    expense?: ExpenseData | null
    budgets: BudgetData[]
    onSubmit: (data: CreateExpenseData | UpdateExpenseData) => void
    onCancel: () => void
    loading?: boolean
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
    expense,
    budgets,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const [formData, setFormData] = useState<CreateExpenseData>({
        description: '',
        amount: 0,
        type: ExpenseType.EXPENSE,
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
        budget_id: '',
        user_id: '',
        note: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // 如果是编辑模式，填充表单数据
    useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description || '',
                amount: expense.amount || 0,
                type: expense.type || ExpenseType.EXPENSE,
                category: expense.category || '',
                expense_date: expense.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                budget_id: expense.budget_id || '',
                user_id: expense.user_id || '',
                note: expense.note || ''
            })
        }
    }, [expense])

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.description.trim()) {
            newErrors.description = '开销描述不能为空'
        }

        if (formData.amount <= 0) {
            newErrors.amount = '开销金额必须大于0'
        }

        if (!formData.budget_id) {
            newErrors.budget_id = '请选择关联的预算'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }))

        // 清除对应字段的错误
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        // 提交数据
        onSubmit(formData)
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {expense ? '编辑开销' : '记录新开销'}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 开销描述 */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        开销描述 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="请输入开销描述"
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 开销金额 */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            金额 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">¥</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                    </div>

                    {/* 开销类型 */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            类型 <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={ExpenseType.EXPENSE}>支出</option>
                            <option value={ExpenseType.INCOME}>收入</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 开销分类 */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            分类
                        </label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例如：餐饮、交通、住宿等"
                        />
                    </div>

                    {/* 开销日期 */}
                    <div>
                        <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-1">
                            日期 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="expense_date"
                            name="expense_date"
                            value={formData.expense_date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* 关联预算 */}
                <div>
                    <label htmlFor="budget_id" className="block text-sm font-medium text-gray-700 mb-1">
                        关联预算 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="budget_id"
                        name="budget_id"
                        value={formData.budget_id}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.budget_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                    >
                        <option value="">请选择预算</option>
                        {budgets.map(budget => (
                            <option key={budget.id} value={budget.id}>
                                {budget.name} (¥{budget.total_amount?.toLocaleString()})
                            </option>
                        ))}
                    </select>
                    {errors.budget_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.budget_id}</p>
                    )}
                </div>

                {/* 备注 */}
                <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                        备注
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入备注信息（可选）"
                    />
                </div>

                {/* 按钮组 */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                提交中...
                            </>
                        ) : (
                            expense ? '更新开销' : '记录开销'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ExpenseForm