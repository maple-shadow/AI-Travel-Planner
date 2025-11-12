// 预算管理主页面
import React, { useState, useEffect } from 'react'
import { BudgetData, ExpenseData, CreateBudgetData, UpdateBudgetData, CreateExpenseData, UpdateExpenseData } from '../types'
import { useBudget, useBudgetStats } from '../hooks'
import { BudgetList, BudgetForm, ExpenseList, ExpenseForm, BudgetStats } from '../components'
import { Card, Typography, Button, Space } from 'antd'
import { DollarOutlined, PlusOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useAuth } from '../../../core/auth'


const { Title, Text } = Typography;

const BudgetManagerPage: React.FC = () => {
    // 状态管理
    const [currentView, setCurrentView] = useState<'overview' | 'budget-detail' | 'create-budget' | 'edit-budget' | 'create-expense' | 'edit-expense'>('overview')
    const [selectedBudget, setSelectedBudget] = useState<BudgetData | null>(null)
    const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null)

    // 使用Hooks
    const budgetHook = useBudget()
    const statsHook = useBudgetStats()
    const { user } = useAuth()

    // 获取当前用户ID（从认证系统获取）
    const currentUserId = user?.id || '12345678-1234-1234-1234-123456789abc' // 如果未登录，使用有效的演示UUID

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
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateNewBudget}
                                    style={{
                                        height: '48px',
                                        padding: '0 24px',
                                        fontSize: '16px'
                                    }}
                                >
                                    创建新预算
                                </Button>
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
                                <Button
                                    type="default"
                                    size="large"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handleBackToOverview}
                                    style={{
                                        height: '48px',
                                        padding: '0 24px',
                                        fontSize: '16px',
                                        marginBottom: '16px'
                                    }}
                                >
                                    返回概览
                                </Button>
                                <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                                    {selectedBudget.title}
                                </Title>
                                {selectedBudget.description && (
                                    <Text type="secondary" style={{ fontSize: '16px', marginTop: '8px' }}>
                                        {selectedBudget.description}
                                    </Text>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditBudget(selectedBudget)}
                                    style={{
                                        height: '48px',
                                        padding: '0 24px',
                                        fontSize: '16px'
                                    }}
                                >
                                    编辑预算
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateNewExpense}
                                    style={{
                                        height: '48px',
                                        padding: '0 24px',
                                        fontSize: '16px'
                                    }}
                                >
                                    记录开销
                                </Button>
                            </div>
                        </div>

                        {/* 预算基本信息 */}
                        <Card style={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <Text type="secondary" style={{ fontSize: '14px' }}>总预算</Text>
                                    <Title level={3} style={{ margin: '8px 0 0 0', color: '#1f2937' }}>
                                        ¥{selectedBudget.total_amount?.toLocaleString()}
                                    </Title>
                                </div>
                                <div className="text-center">
                                    <Text type="secondary" style={{ fontSize: '14px' }}>已使用</Text>
                                    <Title level={3} style={{ margin: '8px 0 0 0', color: '#1f2937' }}>
                                        ¥{(selectedBudget.used_amount || 0).toLocaleString()}
                                    </Title>
                                </div>
                                <div className="text-center">
                                    <Text type="secondary" style={{ fontSize: '14px' }}>剩余</Text>
                                    <Title level={3} style={{ margin: '8px 0 0 0', color: '#52c41a' }}>
                                        ¥{((selectedBudget.total_amount || 0) - (selectedBudget.used_amount || 0)).toLocaleString()}
                                    </Title>
                                </div>
                            </div>
                        </Card>

                        {/* 开销列表 */}
                        <div>
                            <Title level={3} style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
                                开销记录
                            </Title>
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
                        <Button
                            type="default"
                            size="large"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => {
                                setCurrentView(currentView === 'create-budget' ? 'overview' : 'budget-detail')
                            }}
                            style={{
                                height: '48px',
                                padding: '0 24px',
                                fontSize: '16px',
                                marginBottom: '16px'
                            }}
                        >
                            返回
                        </Button>
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
                        <Button
                            type="default"
                            size="large"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => {
                                setCurrentView('budget-detail')
                            }}
                            style={{
                                height: '48px',
                                padding: '0 24px',
                                fontSize: '16px',
                                marginBottom: '16px'
                            }}
                        >
                            返回
                        </Button>
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ maxWidth: 1200, width: '100%', padding: '20px' }}>
                <Card style={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                    {/* 页面标题 */}
                    <div className="text-center mb-8">
                        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                            <DollarOutlined style={{ marginRight: 8 }} />
                            预算管理
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>管理您的旅行预算和开销</Text>
                    </div>

                    {/* 错误提示 - 只显示非预算详情相关的错误 */}
                    {budgetHook.error && !budgetHook.error.includes('获取预算详情') && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '8px'
                        }}>
                            <Space>
                                <Text type="danger">{budgetHook.error}</Text>
                                <Button
                                    type="text"
                                    size="small"
                                    onClick={budgetHook.clearError}
                                    style={{ color: '#ff4d4f' }}
                                >
                                    关闭
                                </Button>
                            </Space>
                        </div>
                    )}

                    {/* 主要内容 */}
                    {renderContent()}
                </Card>
            </div>
        </div>
    )
}

export default BudgetManagerPage