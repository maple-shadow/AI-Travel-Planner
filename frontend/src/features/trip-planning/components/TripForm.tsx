import React from 'react';
import { Trip, TripFormData } from '../types';
import { Form, Input, Button, Card, Typography, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TripFormProps {
    trip?: Trip;
    onSubmit: (formData: TripFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({
    trip,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        onSubmit(values);
    };

    // const today = new Date().toISOString().split('T')[0];

    return (
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2}>
                    {trip ? '编辑行程' : '创建新行程'}
                </Title>
                <Text type="secondary">
                    {trip ? '修改您的旅行计划' : '开始规划您的下一次旅行'}
                </Text>
            </div>

            <Form
                form={form}
                name="tripForm"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                initialValues={{
                    title: trip?.title || '',
                    description: trip?.description || '',
                    destination: trip?.destination || '',
                    startDate: trip?.startDate ? dayjs(trip.startDate) : undefined,
                    endDate: trip?.endDate ? dayjs(trip.endDate) : undefined,
                    budget: trip?.budget || 0,
                }}
            >
                <Form.Item
                    label="行程标题"
                    name="title"
                    rules={[
                        { required: true, message: '请输入行程标题' },
                        { min: 3, message: '标题至少3个字符' },
                        { max: 100, message: '标题不能超过100个字符' }
                    ]}
                >
                    <Input
                        placeholder="请输入行程标题"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="行程描述"
                    name="description"
                    rules={[
                        { max: 500, message: '描述不能超过500个字符' }
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="请输入行程描述（可选）"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="目的地"
                    name="destination"
                    rules={[
                        { required: true, message: '请输入目的地' },
                        { min: 2, message: '目的地至少2个字符' },
                        { max: 200, message: '目的地不能超过200个字符' }
                    ]}
                >
                    <Input
                        placeholder="请输入目的地"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="开始日期"
                    name="startDate"
                    rules={[
                        { required: true, message: '请选择开始日期' }
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="请选择开始日期"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                <Form.Item
                    label="结束日期"
                    name="endDate"
                    rules={[
                        { required: true, message: '请选择结束日期' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startDate = getFieldValue('startDate');
                                if (!startDate || !value || value.isAfter(startDate)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('结束日期必须晚于开始日期'));
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="请选择结束日期"
                        disabledDate={(current) => {
                            const startDate = form.getFieldValue('startDate');
                            return current && startDate && current < startDate;
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="预算 (¥)"
                    name="budget"
                    rules={[
                        { required: true, message: '请输入预算' },
                        { type: 'number', min: 0, message: '预算不能为负数' }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="请输入预算金额"
                        min={0}
                        step={100}
                        formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) as 0}
                    />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button
                            type="default"
                            size="large"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            size="large"
                            icon={trip ? <EditOutlined /> : <PlusOutlined />}
                        >
                            {isLoading ? '处理中...' : (trip ? '更新行程' : '创建行程')}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default TripForm;