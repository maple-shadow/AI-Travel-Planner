// 预算统计组件
import React from 'react'
import { BudgetStats as BudgetStatsType, ExpenseStats } from '../types'
import { Card, Row, Col, Statistic, Typography, Spin, Empty } from 'antd'
import {
    PieChartOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    ShoppingOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

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
            <div className="flex justify-center items-center py-12">
                <Spin size="large" tip="加载中..." />
            </div>
        )
    }

    if (!budgetStats) {
        return (
            <Card className="text-center">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无统计数据"
                >
                    <Text type="secondary">开始使用预算管理功能后，这里将显示统计信息</Text>
                </Empty>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* 总体统计 */}
            <Row gutter={[16, 16]}>
                {/* 总预算数 */}
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="总预算数"
                            value={budgetStats.total_budgets}
                            prefix={<PieChartOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                {/* 活跃预算 */}
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="活跃预算"
                            value={budgetStats.active_budgets}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                {/* 总预算金额 */}
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="总预算金额"
                            value={budgetStats.total_amount}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>

                {/* 已使用金额 */}
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="已使用金额"
                            value={budgetStats.total_used_amount}
                            precision={2}
                            prefix={<ShoppingOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 开销统计 */}
            {expenseStats && (
                <Card title="开销统计" className="mt-6">
                    <Row gutter={[16, 16]}>
                        {/* 总开销数 */}
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="总开销数"
                                value={expenseStats.total_expenses}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Col>

                        {/* 总支出 */}
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="总支出"
                                value={expenseStats.total_expense_amount}
                                precision={2}
                                prefix="¥"
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Col>

                        {/* 总收入 */}
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="总收入"
                                value={expenseStats.total_income_amount}
                                precision={2}
                                prefix="¥"
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Col>
                    </Row>

                    {/* 开销分类统计 */}
                    {expenseStats.category_stats && Object.keys(expenseStats.category_stats).length > 0 && (
                        <div className="mt-6">
                            <Title level={4}>分类统计</Title>
                            <Row gutter={[8, 8]}>
                                {Object.entries(expenseStats.category_stats).map(([category, amount]) => (
                                    <Col xs={12} sm={8} md={6} key={category}>
                                        <Card size="small">
                                            <Statistic
                                                title={category}
                                                value={amount}
                                                precision={2}
                                                prefix="¥"
                                                valueStyle={{ fontSize: '14px' }}
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {/* 月度开销趋势 */}
                    {expenseStats.monthly_stats && Object.keys(expenseStats.monthly_stats).length > 0 && (
                        <div className="mt-6">
                            <Title level={4}>月度开销趋势</Title>
                            <Row gutter={[8, 8]}>
                                {Object.entries(expenseStats.monthly_stats)
                                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                                    .slice(-6) // 显示最近6个月
                                    .map(([month, amount]) => (
                                        <Col xs={12} sm={8} md={6} key={month}>
                                            <Card size="small">
                                                <Statistic
                                                    title={new Date(month).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}
                                                    value={amount}
                                                    precision={2}
                                                    prefix="¥"
                                                    valueStyle={{ fontSize: '14px' }}
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                            </Row>
                        </div>
                    )}
                </Card>
            )}


        </div>
    )
}

export default BudgetStats