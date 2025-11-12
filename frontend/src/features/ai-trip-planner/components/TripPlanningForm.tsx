import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Card,
    Space,
    Select,
    Typography,
    message
} from 'antd';
import dayjs from 'dayjs';
import {
    CalendarOutlined,
    UserOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    RocketOutlined,
    AudioOutlined
} from '@ant-design/icons';
import { TripPlanningRequest } from '../types';
import VoiceInput from './VoiceInput';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface TripPlanningFormProps {
    onSubmit: (request: TripPlanningRequest) => void;
    loading?: boolean;
}

/**
 * 行程规划表单组件
 * 支持语音和文本输入旅行信息
 */
export const TripPlanningForm: React.FC<TripPlanningFormProps> = ({
    onSubmit,
    loading = false
}) => {
    const [form] = Form.useForm();
    const [voiceInput, setVoiceInput] = useState('');

    // 旅行偏好选项
    const preferenceOptions = [
        { label: '美食', value: '美食' },
        { label: '购物', value: '购物' },
        { label: '自然风光', value: '自然风光' },
        { label: '历史文化', value: '历史文化' },
        { label: '冒险活动', value: '冒险活动' },
        { label: '休闲度假', value: '休闲度假' },
        { label: '亲子活动', value: '亲子活动' },
        { label: '摄影', value: '摄影' },
        { label: '夜生活', value: '夜生活' },
        { label: '温泉', value: '温泉' }
    ];

    // 处理语音输入
    useEffect(() => {
        if (voiceInput && voiceInput.trim()) {
            // 使用防抖机制避免循环引用
            const timer = setTimeout(() => {
                parseVoiceInput(voiceInput);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [voiceInput]);

    // 解析语音输入，提取关键信息
    const parseVoiceInput = (text: string) => {
        const parsedData: any = {};
        console.log('开始解析语音输入:', text);

        // 提取目的地 - 多种匹配模式
        const destinationPatterns = [
            /去(.+?)[，。\s]/,
            /想去(.+?)[，。\s]/,
            /计划去(.+?)[，。\s]/,
            /到(.+?)[，。\s]/,
            /目的地是(.+?)[，。\s]/
        ];

        for (const pattern of destinationPatterns) {
            const match = text.match(pattern);
            if (match) {
                parsedData.destination = match[1].trim();
                console.log('提取到目的地:', parsedData.destination);
                break;
            }
        }

        // 提取天数 - 多种匹配模式
        const daysPatterns = [
            /(\d+)\s*天/,
            /(\d+)\s*日/,
            /(\d+)\s*晚/,
            /(\d+)\s*个?工作日/,
            /(\d+)\s*个?周末/
        ];

        for (const pattern of daysPatterns) {
            const match = text.match(pattern);
            if (match) {
                const days = parseInt(match[1]);
                if (days > 0 && days <= 30) {
                    const startDate = dayjs();
                    const endDate = dayjs().add(days, 'day');
                    parsedData.dateRange = [startDate, endDate];
                    console.log('提取到天数:', days, '日期范围:', parsedData.dateRange);
                    break;
                }
            }
        }

        // 提取预算 - 多种匹配模式
        const budgetPatterns = [
            /(\d+)\s*元/,
            /(\d+)\s*块钱/,
            /(\d+)\s*人民币/,
            /预算(\d+)/,
            /花费(\d+)/,
            /准备(\d+)/
        ];

        for (const pattern of budgetPatterns) {
            const match = text.match(pattern);
            if (match) {
                const budget = parseInt(match[1]);
                if (budget > 0 && budget <= 100000) {
                    parsedData.budget = budget;
                    console.log('提取到预算:', parsedData.budget);
                    break;
                }
            }
        }

        // 提取人数 - 多种匹配模式
        const travelersPatterns = [
            /(\d+)\s*人/,
            /(\d+)\s*个人/,
            /(\d+)\s*位/,
            /(\d+)\s*名/,
            /(\d+)\s*个?朋友/,
            /(\d+)\s*个?家人/
        ];

        for (const pattern of travelersPatterns) {
            const match = text.match(pattern);
            if (match) {
                const travelers = parseInt(match[1]);
                if (travelers > 0 && travelers <= 10) {
                    parsedData.travelers = travelers;
                    console.log('提取到人数:', parsedData.travelers);
                    break;
                }
            }
        }

        // 提取偏好 - 更灵活的匹配
        const preferences: string[] = [];
        preferenceOptions.forEach(option => {
            // 检查是否包含偏好关键词
            if (text.includes(option.value) ||
                text.includes(option.label) ||
                text.includes(option.value.replace('活动', '')) ||
                text.includes(option.value.replace('风光', ''))) {
                preferences.push(option.value);
            }
        });

        if (preferences.length > 0) {
            parsedData.preferences = preferences;
            console.log('提取到偏好:', parsedData.preferences);
        }

        // 更新表单
        if (Object.keys(parsedData).length > 0) {
            console.log('更新表单数据:', parsedData);
            form.setFieldsValue(parsedData);
        }

        // 如果语音输入包含完整信息，自动填充描述
        if (parsedData.destination && parsedData.dateRange) {
            form.setFieldValue('description', text);
            console.log('自动填充描述:', text);
        }

        // 显示解析结果提示
        if (Object.keys(parsedData).length > 0) {
            message.success('语音输入已自动解析并填充到表单');
        }
    };

    // 处理表单提交
    const handleSubmit = (values: any) => {
        const { destination, dateRange, budget, travelers, preferences, description } = values;

        if (!dateRange || dateRange.length !== 2) {
            message.error('请选择旅行日期范围');
            return;
        }

        // 处理日期格式，确保是有效的日期字符串
        const formatDate = (date: any) => {
            if (date && typeof date.format === 'function') {
                return date.format('YYYY-MM-DD');
            }
            if (date instanceof Date) {
                return date.toISOString().split('T')[0];
            }
            // 如果是dayjs对象
            if (date && dayjs.isDayjs(date)) {
                return date.format('YYYY-MM-DD');
            }
            return date;
        };

        const request: TripPlanningRequest = {
            destination: destination.trim(),
            startDate: formatDate(dateRange[0]),
            endDate: formatDate(dateRange[1]),
            budget: budget || 5000,
            travelers: travelers || 1,
            preferences: preferences || [],
            description: description || `前往${destination}的旅行`
        };

        onSubmit(request);
    };

    return (
        <Card
            title={
                <Space>
                    <RocketOutlined style={{ color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>智能行程规划</Title>
                </Space>
            }
            style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    budget: 5000,
                    travelers: 1,
                    preferences: []
                }}
            >
                {/* 旅行需求输入区域 - 支持语音和打字输入 */}
                <Form.Item
                    label={
                        <Space>
                            <AudioOutlined />
                            <Text strong>旅行需求输入</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                (支持语音输入或直接打字输入)
                            </Text>
                        </Space>
                    }
                >
                    <div style={{ marginBottom: '16px' }}>
                        <TextArea
                            rows={3}
                            placeholder="请直接输入您的旅行需求，例如：我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                            value={voiceInput}
                            onChange={(e) => setVoiceInput(e.target.value)}
                            disabled={loading}
                            style={{ marginBottom: '12px' }}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                或使用语音输入
                            </Text>
                        </div>
                    </div>
                    <VoiceInput
                        onTextChange={setVoiceInput}
                        placeholder="例如：我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                        disabled={loading}
                    />
                </Form.Item>

                {/* 目的地 */}
                <Form.Item
                    label={
                        <Space>
                            <EnvironmentOutlined />
                            <Text strong>目的地</Text>
                        </Space>
                    }
                    name="destination"
                    rules={[{ required: true, message: '请输入旅行目的地' }]}
                >
                    <Input
                        placeholder="请输入城市或国家名称"
                        size="large"
                        disabled={loading}
                    />
                </Form.Item>

                {/* 旅行日期 */}
                <Form.Item
                    label={
                        <Space>
                            <CalendarOutlined />
                            <Text strong>旅行日期</Text>
                        </Space>
                    }
                    name="dateRange"
                    rules={[{ required: true, message: '请选择旅行日期范围' }]}
                >
                    <RangePicker
                        style={{ width: '100%' }}
                        size="large"
                        disabled={loading}
                    />
                </Form.Item>

                {/* 预算和人数 */}
                <Space style={{ width: '100%' }} size="middle">
                    <Form.Item
                        label={
                            <Space>
                                <DollarOutlined />
                                <Text strong>预算(元)</Text>
                            </Space>
                        }
                        name="budget"
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={100}
                            max={100000}
                            step={100}
                            size="large"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <Space>
                                <UserOutlined />
                                <Text strong>同行人数</Text>
                            </Space>
                        }
                        name="travelers"
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            max={20}
                            size="large"
                            disabled={loading}
                        />
                    </Form.Item>
                </Space>

                {/* 旅行偏好 */}
                <Form.Item
                    label={<Text strong>旅行偏好</Text>}
                    name="preferences"
                >
                    <Select
                        mode="multiple"
                        placeholder="请选择您的旅行偏好"
                        size="large"
                        disabled={loading}
                    >
                        {preferenceOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* 详细描述 */}
                <Form.Item
                    label={<Text strong>详细描述</Text>}
                    name="description"
                >
                    <TextArea
                        rows={3}
                        placeholder="请详细描述您的旅行需求，或使用语音输入自动填充"
                        disabled={loading}
                    />
                </Form.Item>

                {/* 提交按钮 */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        style={{ width: '100%', height: '48px' }}
                        icon={<RocketOutlined />}
                    >
                        {loading ? 'AI正在规划中...' : '开始智能规划'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default TripPlanningForm;