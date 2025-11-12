// 预算表单组件
import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Typography, Select, DatePicker, InputNumber } from 'antd'
import dayjs from 'dayjs'
import { BudgetData, CreateBudgetData, UpdateBudgetData, BudgetCategory } from '../types'
import { tripService } from '../../trip-planning/services/tripService'
import { Trip } from '../../trip-planning/types'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

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
    const [form] = Form.useForm()
    const [trips, setTrips] = useState<Trip[]>([])
    const [tripsLoading, setTripsLoading] = useState(false)

    // 加载用户行程列表
    useEffect(() => {
        const loadTrips = async () => {
            setTripsLoading(true)
            try {
                const userTrips = await tripService.getTrips()
                setTrips(userTrips)
            } catch (error) {
                console.error('加载行程列表失败:', error)
            } finally {
                setTripsLoading(false)
            }
        }

        loadTrips()
    }, [])

    // 如果是编辑模式，填充表单数据
    useEffect(() => {
        if (budget) {
            form.setFieldsValue({
                title: budget.title || '',
                description: budget.description || '',
                total_amount: budget.total_amount || 0,
                currency: budget.currency || 'CNY',
                category: budget.category || BudgetCategory.TRAVEL,
                start_date: budget.start_date ? dayjs(budget.start_date) : dayjs(),
                end_date: budget.end_date ? dayjs(budget.end_date) : null,
                user_id: budget.user_id || '',
                trip_id: budget.trip_id || ''
            })
        } else {
            form.setFieldsValue({
                title: '',
                description: '',
                total_amount: 0,
                currency: 'CNY',
                category: BudgetCategory.TRAVEL,
                start_date: dayjs(),
                end_date: null,
                user_id: '',
                trip_id: ''
            })
        }
    }, [budget, form])

    // 处理表单提交
    const handleSubmit = async (values: any) => {
        try {
            const submitData = {
                ...values,
                // 将前端字段名映射为后端期望的字段名
                trip_id: values.trip_id,
                total_amount: values.total_amount,
                currency: values.currency,
                category: values.category,
                start_date: values.start_date ? values.start_date.toDate() : new Date(),
                end_date: values.end_date ? values.end_date.toDate() : new Date(),
                title: values.title,
                description: values.description
            }
            await onSubmit(submitData)
        } catch (error) {
            console.error('表单提交错误:', error)
        }
    }

    return (
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>{budget ? '编辑预算' : '创建新预算'}</Title>
                <Text type="secondary">
                    {budget ? '修改您的预算信息' : '为您的旅行创建新的预算计划'}
                </Text>
            </div>

            <Form
                form={form}
                name="budget-form"
                onFinish={handleSubmit}
                autoComplete="off"
                layout="vertical"
                size="large"
            >
                {/* 关联行程 */}
                <Form.Item
                    label="关联行程"
                    name="trip_id"
                    rules={[
                        { required: true, message: '请选择关联的行程' }
                    ]}
                >
                    <Select
                        placeholder="请选择关联的行程"
                        loading={tripsLoading}
                        allowClear
                    >
                        {trips.map(trip => (
                            <Option key={trip.id} value={trip.id}>
                                {trip.title} - {trip.destination} ({trip.startDate} 至 {trip.endDate})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* 预算名称 */}
                <Form.Item
                    label="预算名称"
                    name="title"
                    rules={[
                        { required: true, message: '请输入预算名称' },
                        { min: 2, message: '预算名称至少2个字符' },
                        { max: 50, message: '预算名称不能超过50个字符' }
                    ]}
                >
                    <Input placeholder="请输入预算名称" />
                </Form.Item>

                {/* 预算描述 */}
                <Form.Item
                    label="预算描述"
                    name="description"
                    rules={[
                        { max: 200, message: '预算描述不能超过200个字符' }
                    ]}
                >
                    <TextArea rows={3} placeholder="请输入预算描述（可选）" />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* 预算金额 */}
                    <Form.Item
                        label="预算金额"
                        name="total_amount"
                        rules={[
                            { required: true, message: '请输入预算金额' },
                            { type: 'number', min: 0.01, message: '预算金额必须大于0' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                            placeholder="0.00"
                        />
                    </Form.Item>

                    {/* 货币类型 */}
                    <Form.Item
                        label="货币类型"
                        name="currency"
                        rules={[
                            { required: true, message: '请选择货币类型' }
                        ]}
                    >
                        <Select placeholder="请选择货币类型">
                            <Option value="CNY">人民币 (CNY)</Option>
                            <Option value="USD">美元 (USD)</Option>
                            <Option value="EUR">欧元 (EUR)</Option>
                            <Option value="JPY">日元 (JPY)</Option>
                        </Select>
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* 预算分类 */}
                    <Form.Item
                        label="预算分类"
                        name="category"
                        rules={[
                            { required: true, message: '请选择预算分类' }
                        ]}
                    >
                        <Select placeholder="请选择预算分类">
                            <Option value={BudgetCategory.TRAVEL}>旅行</Option>
                            <Option value={BudgetCategory.FOOD}>餐饮</Option>
                            <Option value={BudgetCategory.ACCOMMODATION}>住宿</Option>
                            <Option value={BudgetCategory.TRANSPORTATION}>交通</Option>
                            <Option value={BudgetCategory.ENTERTAINMENT}>娱乐</Option>
                            <Option value={BudgetCategory.SHOPPING}>购物</Option>
                            <Option value={BudgetCategory.OTHER}>其他</Option>
                        </Select>
                    </Form.Item>

                    {/* 占位符，保持布局平衡 */}
                    <div></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* 开始日期 */}
                    <Form.Item
                        label="开始日期"
                        name="start_date"
                        rules={[
                            { required: true, message: '请选择开始日期' }
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    {/* 结束日期 */}
                    <Form.Item
                        label="结束日期"
                        name="end_date"
                        rules={[
                            { required: true, message: '请选择结束日期' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue('start_date')
                                    if (!value || !startDate || value > startDate) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('结束日期必须晚于开始日期'))
                                },
                            }),
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                {/* 按钮组 */}
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button
                        onClick={onCancel}
                        style={{ marginRight: 8 }}
                        disabled={loading}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {budget ? '更新预算' : '创建预算'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

export default BudgetForm