// 开销表单组件
import React, { useState, useEffect } from 'react'
import { ExpenseData, CreateExpenseData, UpdateExpenseData, ExpenseType, BudgetData, BudgetCategory } from '../types'
import { Form, Input, Button, Card, Typography, Select, InputNumber, DatePicker, message } from 'antd'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface ExpenseFormProps {
    expense?: ExpenseData | null
    budgets: BudgetData[]
    onSubmit: (data: CreateExpenseData | UpdateExpenseData) => void | Promise<void>
    onCancel: () => void
    loading?: boolean
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
    expense,
    budgets,
    onSubmit,
    onCancel
}) => {
    const [form] = Form.useForm()
    const [submitLoading, setSubmitLoading] = useState(false)

    // 如果是编辑模式，填充表单数据
    useEffect(() => {
        if (expense) {
            // 使用dayjs安全地处理日期，避免无效的Date对象
            let dateValue: dayjs.Dayjs;
            if (expense.expense_date) {
                const parsedDate = dayjs(expense.expense_date);
                dateValue = parsedDate.isValid() ? parsedDate : dayjs();
            } else {
                dateValue = dayjs();
            }

            form.setFieldsValue({
                title: expense.title,
                description: expense.description || '',
                amount: expense.amount,
                type: expense.type,
                category: expense.category,
                date: dateValue,
                budget_id: expense.budget_id,
                user_id: expense.user_id
            });
        } else {
            form.setFieldsValue({
                date: dayjs(),
                type: ExpenseType.EXPENSE,
                category: BudgetCategory.OTHER
            });
        }
    }, [expense, form])

    // 处理表单提交
    const handleSubmit = async (values: any) => {
        setSubmitLoading(true);
        try {
            // 使用dayjs安全地处理日期转换
            let expenseDate: string;
            if (values.date && dayjs.isDayjs(values.date) && values.date.isValid()) {
                expenseDate = values.date.format('YYYY-MM-DD');
            } else {
                expenseDate = dayjs().format('YYYY-MM-DD');
            }

            const submitData = {
                ...values,
                expense_date: expenseDate,
                budget_id: values.budget_id || '',
                user_id: '' // 实际应用中应该从用户上下文获取
            };

            // 删除前端使用的date字段，使用后端需要的expense_date字段
            delete submitData.date;

            await onSubmit(submitData);
            message.success(expense ? '开销更新成功' : '开销创建成功');
        } catch (error) {
            console.error('保存开销失败:', error);
            message.error('保存开销失败，请重试');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>{expense ? '编辑开销' : '记录开销'}</Title>
                <Text type="secondary">
                    {expense ? '修改您的开销信息' : '为您的预算记录新的开销'}
                </Text>
            </div>

            <Form
                form={form}
                name="expense-form"
                onFinish={handleSubmit}
                autoComplete="off"
                layout="vertical"
                size="large"
            >
                {/* 开销名称 */}
                <Form.Item
                    label="开销名称"
                    name="title"
                    rules={[
                        { required: true, message: '请输入开销名称' },
                        { min: 2, message: '开销名称至少2个字符' },
                        { max: 50, message: '开销名称不能超过50个字符' }
                    ]}
                >
                    <Input placeholder="请输入开销名称" />
                </Form.Item>

                {/* 开销描述 */}
                <Form.Item
                    label="开销描述"
                    name="description"
                    rules={[
                        { required: true, message: '请输入开销描述' },
                        { max: 200, message: '开销描述不能超过200个字符' }
                    ]}
                >
                    <TextArea rows={3} placeholder="请输入开销描述" />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* 开销金额 */}
                    <Form.Item
                        label="开销金额"
                        name="amount"
                        rules={[
                            { required: true, message: '请输入开销金额' },
                            { type: 'number', min: 0.01, message: '开销金额必须大于0' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                            placeholder="0.00"
                        />
                    </Form.Item>

                    {/* 开销类型 */}
                    <Form.Item
                        label="开销类型"
                        name="type"
                        rules={[
                            { required: true, message: '请选择开销类型' }
                        ]}
                    >
                        <Select placeholder="请选择开销类型">
                            <Option value={ExpenseType.EXPENSE}>支出</Option>
                            <Option value={ExpenseType.INCOME}>收入</Option>
                        </Select>
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* 开销分类 */}
                    <Form.Item
                        label="开销分类"
                        name="category"
                        rules={[
                            { required: true, message: '请选择开销分类' }
                        ]}
                    >
                        <Select placeholder="请选择开销分类">
                            <Option value={BudgetCategory.TRAVEL}>旅行</Option>
                            <Option value={BudgetCategory.FOOD}>餐饮</Option>
                            <Option value={BudgetCategory.ACCOMMODATION}>住宿</Option>
                            <Option value={BudgetCategory.TRANSPORTATION}>交通</Option>
                            <Option value={BudgetCategory.ENTERTAINMENT}>娱乐</Option>
                            <Option value={BudgetCategory.SHOPPING}>购物</Option>
                            <Option value={BudgetCategory.OTHER}>其他</Option>
                        </Select>
                    </Form.Item>

                    {/* 开销日期 */}
                    <Form.Item
                        label="开销日期"
                        name="date"
                        rules={[
                            { required: true, message: '请选择开销日期' }
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                {/* 关联预算 */}
                <Form.Item
                    label="关联预算"
                    name="budget_id"
                    rules={[
                        { required: true, message: '请选择关联预算' }
                    ]}
                >
                    <Select placeholder="请选择预算">
                        {budgets.map(budget => (
                            <Option key={budget.id} value={budget.id}>
                                {budget.title} (¥{budget.total_amount?.toLocaleString()})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* 按钮组 */}
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button
                        onClick={onCancel}
                        style={{ marginRight: 8 }}
                        disabled={submitLoading}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitLoading}
                    >
                        {expense ? '更新开销' : '记录开销'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

export default ExpenseForm