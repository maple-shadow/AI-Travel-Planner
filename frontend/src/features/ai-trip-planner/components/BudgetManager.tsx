import React, { useState } from 'react';
import { Card, Typography, Space, Button, InputNumber, Form, Input, List, Tag, message } from 'antd';
import {
    DollarOutlined,
    PlusOutlined,
    DeleteOutlined,
    AudioOutlined,
    PieChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Expense {
    id: string;
    category: string;
    amount: number;
    description: string;
    date: string;
}

interface BudgetManagerProps {
    totalBudget: number;
    onExpenseAdd?: (expense: Expense) => void;
}

/**
 * 预算管理组件
 * 支持语音记录开销和预算分析
 */
export const BudgetManager: React.FC<BudgetManagerProps> = ({
    totalBudget,
    onExpenseAdd
}) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isVoiceInput, setIsVoiceInput] = useState(false);
    const [form] = Form.useForm();

    // 计算总支出
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBudget = totalBudget - totalExpenses;
    const budgetUsage = (totalExpenses / totalBudget) * 100;

    // 按类别统计支出
    const categoryStats = expenses.reduce((stats, expense) => {
        if (!stats[expense.category]) {
            stats[expense.category] = 0;
        }
        stats[expense.category] += expense.amount;
        return stats;
    }, {} as Record<string, number>);

    // 添加支出
    const handleAddExpense = (values: any) => {
        const newExpense: Expense = {
            id: Date.now().toString(),
            category: values.category || '其他',
            amount: values.amount,
            description: values.description,
            date: new Date().toISOString().split('T')[0]
        };

        if (newExpense.amount > remainingBudget) {
            message.warning('支出金额超过剩余预算！');
            return;
        }

        setExpenses(prev => [...prev, newExpense]);
        onExpenseAdd?.(newExpense);
        form.resetFields();
        message.success('支出记录添加成功');
    };

    // 删除支出
    const handleDeleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
        message.success('支出记录已删除');
    };

    // 处理语音输入
    const handleVoiceInput = () => {
        setIsVoiceInput(true);
        // 模拟语音识别过程
        setTimeout(() => {
            // 模拟语音识别结果
            const mockVoiceResult = {
                category: '餐饮',
                amount: 150,
                description: '午餐费用'
            };

            form.setFieldsValue(mockVoiceResult);
            setIsVoiceInput(false);
            message.success('语音识别完成，已自动填充表单');
        }, 2000);
    };

    // 支出类别选项
    const expenseCategories = [
        '交通', '住宿', '餐饮', '购物', '门票', '娱乐', '其他'
    ];

    return (
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
            {/* 预算概览 */}
            <Card
                title={
                    <Space>
                        <PieChartOutlined style={{ color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>预算概览</Title>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>总预算：</Text>
                        <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                            ¥{totalBudget.toLocaleString()}
                        </Text>
                    </Space>

                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>已支出：</Text>
                        <Text strong style={{ color: '#fa541c', fontSize: '18px' }}>
                            ¥{totalExpenses.toLocaleString()}
                        </Text>
                    </Space>

                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>剩余预算：</Text>
                        <Text strong style={{
                            color: remainingBudget > 0 ? '#13c2c2' : '#f5222d',
                            fontSize: '18px'
                        }}>
                            ¥{remainingBudget.toLocaleString()}
                        </Text>
                    </Space>

                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div
                            style={{
                                width: `${Math.min(budgetUsage, 100)}%`,
                                height: '100%',
                                backgroundColor: budgetUsage > 80 ? '#f5222d' :
                                    budgetUsage > 60 ? '#faad14' : '#52c41a',
                                transition: 'all 0.3s'
                            }}
                        />
                    </div>

                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        预算使用率: {budgetUsage.toFixed(1)}%
                    </Text>
                </Space>
            </Card>

            {/* 添加支出表单 */}
            <Card
                title={
                    <Space>
                        <DollarOutlined style={{ color: '#52c41a' }} />
                        <Title level={4} style={{ margin: 0 }}>记录支出</Title>
                    </Space>
                }
                style={{ marginBottom: 24 }}
                extra={
                    <Button
                        type="dashed"
                        icon={<AudioOutlined />}
                        onClick={handleVoiceInput}
                        loading={isVoiceInput}
                    >
                        语音记录
                    </Button>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddExpense}
                >
                    <Space style={{ width: '100%' }} size="middle">
                        <Form.Item
                            name="category"
                            label="类别"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: '请选择支出类别' }]}
                        >
                            <Input placeholder="选择或输入类别" list="categories" />
                            <datalist id="categories">
                                {expenseCategories.map(category => (
                                    <option key={category} value={category} />
                                ))}
                            </datalist>
                        </Form.Item>

                        <Form.Item
                            name="amount"
                            label="金额(元)"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: '请输入金额' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                max={remainingBudget}
                                precision={2}
                                placeholder="支出金额"
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="支出描述（可选）"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<PlusOutlined />}
                            style={{ width: '100%' }}
                        >
                            添加支出记录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* 支出记录列表 */}
            <Card
                title={
                    <Space>
                        <DollarOutlined style={{ color: '#fa541c' }} />
                        <Title level={4} style={{ margin: 0 }}>支出记录</Title>
                    </Space>
                }
            >
                {expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">暂无支出记录</Text>
                    </div>
                ) : (
                    <List
                        dataSource={expenses}
                        renderItem={(expense) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteExpense(expense.id)}
                                    >
                                        删除
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Tag color="blue" style={{ margin: 0 }}>
                                            {expense.category}
                                        </Tag>
                                    }
                                    title={
                                        <Space>
                                            <Text strong style={{ color: '#fa541c', fontSize: '16px' }}>
                                                ¥{expense.amount}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {expense.date}
                                            </Text>
                                        </Space>
                                    }
                                    description={expense.description || '无描述'}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            {/* 支出类别统计 */}
            {Object.keys(categoryStats).length > 0 && (
                <Card
                    title={
                        <Space>
                            <PieChartOutlined style={{ color: '#722ed1' }} />
                            <Title level={4} style={{ margin: 0 }}>支出类别统计</Title>
                        </Space>
                    }
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Object.entries(categoryStats).map(([category, amount]) => (
                            <Space key={category} style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Tag color="geekblue">{category}</Tag>
                                <Text strong>¥{amount.toLocaleString()}</Text>
                                <Text type="secondary">
                                    {((amount / totalExpenses) * 100).toFixed(1)}%
                                </Text>
                            </Space>
                        ))}
                    </Space>
                </Card>
            )}
        </div>
    );
};

export default BudgetManager;