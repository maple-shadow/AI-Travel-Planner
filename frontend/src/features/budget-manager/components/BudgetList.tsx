// 预算列表组件
import React from 'react'
import { BudgetData, BudgetStatus } from '../types'
import { useBudget } from '../hooks'
import { Card, List, Tag, Progress, Button, Typography, Empty, Spin, Alert } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const { Text, Title } = Typography;

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



    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>加载中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <Alert
                message="加载失败"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
            />
        )
    }

    if (budgets.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无预算"
            >
                <Text type="secondary">开始创建您的第一个预算吧！</Text>
            </Empty>
        )
    }

    return (
        <List
            dataSource={budgets}
            renderItem={(budget) => {
                const usageRate = calculateUsageRate(budget)
                const statusColor = getStatusStyle(budget.status).includes('green') ? 'success' :
                    getStatusStyle(budget.status).includes('red') ? 'error' :
                        getStatusStyle(budget.status).includes('blue') ? 'processing' : 'default'

                return (
                    <List.Item key={budget.id}>
                        <Card
                            style={{ width: '100%' }}
                            actions={[
                                <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() => onSelectBudget(budget)}
                                >
                                    查看详情
                                </Button>,
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => onEditBudget(budget)}
                                >
                                    编辑
                                </Button>,
                                <Button
                                    type="link"
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={() => onDeleteBudget(budget)}
                                >
                                    删除
                                </Button>
                            ]}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <Title level={4} style={{ marginBottom: 8, cursor: 'pointer' }}
                                        onClick={() => onSelectBudget(budget)}>
                                        {budget.title}
                                    </Title>
                                    <Text type="secondary">{budget.description}</Text>
                                </div>
                                <Tag color={statusColor}>{budget.status}</Tag>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <Text type="secondary">总预算</Text>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                        ¥{budget.total_amount?.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary">已使用</Text>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                        ¥{(budget.used_amount || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* 使用率进度条 */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text type="secondary">使用率</Text>
                                    <Text strong>{usageRate.toFixed(1)}%</Text>
                                </div>
                                <Progress
                                    percent={Math.min(usageRate, 100)}
                                    status={usageRate >= 100 ? 'exception' : usageRate >= 80 ? 'active' : 'normal'}
                                    strokeColor={usageRate >= 100 ? '#ff4d4f' : usageRate >= 80 ? '#faad14' : '#52c41a'}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text type="secondary">
                                    {budget.start_date && new Date(budget.start_date).toLocaleDateString()}
                                    {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString()}`}
                                </Text>
                            </div>
                        </Card>
                    </List.Item>
                )
            }}
        />
    )
}

export default BudgetList