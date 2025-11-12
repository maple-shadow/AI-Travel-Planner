// 开销列表组件
import React from 'react'
import { ExpenseData, ExpenseType } from '../types'
import { List, Card, Tag, Button, Typography, Empty, Space } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Text } = Typography

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


    if (expenses.length === 0) {
        return (
            <Card className="text-center">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无开销记录"
                >
                    <Text type="secondary">开始记录您的第一笔开销吧！</Text>
                </Empty>
            </Card>
        )
    }

    return (
        <List
            dataSource={expenses}
            renderItem={(expense) => (
                <List.Item>
                    <Card
                        className="w-full"
                        actions={[
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => onEditExpense(expense)}
                                key="edit"
                            >
                                编辑
                            </Button>,
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => onDeleteExpense(expense)}
                                key="delete"
                            >
                                删除
                            </Button>
                        ]}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <Space direction="vertical" size="small" className="w-full">
                                    <div className="flex items-center space-x-2">
                                        <Tag
                                            color={expense.type === ExpenseType.INCOME ? 'green' : 'red'}
                                            icon={expense.type === ExpenseType.INCOME ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        >
                                            {expense.type === ExpenseType.INCOME ? '收入' : '支出'}
                                        </Tag>
                                        {showBudgetName && expense.budget_id && (
                                            <Tag color="blue">预算ID: {expense.budget_id}</Tag>
                                        )}
                                    </div>

                                    <Text strong>{expense.title}</Text>

                                    {expense.category && (
                                        <Text type="secondary">分类: {expense.category}</Text>
                                    )}

                                    {expense.description && (
                                        <Text type="secondary">{expense.description}</Text>
                                    )}
                                </Space>
                            </div>

                            <div className="text-right">
                                <Text
                                    strong
                                    type={expense.type === ExpenseType.INCOME ? 'success' : 'danger'}
                                    style={{ fontSize: '16px' }}
                                >
                                    {expense.type === ExpenseType.INCOME ? '+' : '-'}¥{expense.amount.toLocaleString()}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {expense.expense_date && new Date(expense.expense_date).toLocaleDateString()}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </List.Item>
            )}
        />
    )
}

export default ExpenseList