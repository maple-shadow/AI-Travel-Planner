// 预算表单组件
import React, { useState, useEffect } from 'react'
import { BudgetData, CreateBudgetData, UpdateBudgetData, BudgetCategory } from '../types'

interface BudgetFormProps {
    budget?: BudgetData | null
    onSubmit: (data: CreateBudgetData | UpdateBudgetData) => void | Promise<void>
    onCancel: () => void
    loading?: boolean
}

const BudgetForm: React.FC<BudgetFormProps> = ({
    budget,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const [formData, setFormData] = useState<CreateBudgetData>({
        title: '',
        description: '',
        total_amount: 0,
        currency: 'CNY',
        category: BudgetCategory.TRAVEL,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        user_id: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // 如果是编辑模式，填充表单数据
    useEffect(() => {
        if (budget) {
            setFormData({
                title: budget.title || '',
                description: budget.description || '',
                total_amount: budget.total_amount || 0,
                currency: budget.currency || 'CNY',
                category: budget.category || BudgetCategory.TRAVEL,
                start_date: budget.start_date ? new Date(budget.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                end_date: budget.end_date ? new Date(budget.end_date).toISOString().split('T')[0] : '',
                user_id: budget.user_id || ''
            })
        }
    }, [budget])

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = '预算名称不能为空'
        }

        if (formData.total_amount <= 0) {
            newErrors.total_amount = '预算金额必须大于0'
        }

        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date)
            const endDate = new Date(formData.end_date)
            if (endDate <= startDate) {
                newErrors.end_date = '结束日期必须晚于开始日期'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: name === 'total_amount' ? parseFloat(value) || 0 : value
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
                    {budget ? '编辑预算' : '创建新预算'}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 预算名称 */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        预算名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="请输入预算名称"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                </div>

                {/* 预算描述 */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        预算描述
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入预算描述（可选）"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 预算金额 */}
                    <div>
                        <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-1">
                            预算金额 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">¥</span>
                            </div>
                            <input
                                type="number"
                                id="total_amount"
                                name="total_amount"
                                value={formData.total_amount}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.total_amount ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.total_amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.total_amount}</p>
                        )}
                    </div>

                    {/* 货币类型 */}
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                            货币类型
                        </label>
                        <select
                            id="currency"
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="CNY">人民币 (CNY)</option>
                            <option value="USD">美元 (USD)</option>
                            <option value="EUR">欧元 (EUR)</option>
                            <option value="JPY">日元 (JPY)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 预算分类 */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            预算分类
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={BudgetCategory.TRAVEL}>旅行</option>
                            <option value={BudgetCategory.FOOD}>餐饮</option>
                            <option value={BudgetCategory.ACCOMMODATION}>住宿</option>
                            <option value={BudgetCategory.TRANSPORTATION}>交通</option>
                            <option value={BudgetCategory.ENTERTAINMENT}>娱乐</option>
                            <option value={BudgetCategory.SHOPPING}>购物</option>
                            <option value={BudgetCategory.OTHER}>其他</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 开始日期 */}
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                            开始日期
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 结束日期 */}
                    <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                            结束日期
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.end_date ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {errors.end_date && (
                            <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                        )}
                    </div>
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
                            budget ? '更新预算' : '创建预算'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default BudgetForm