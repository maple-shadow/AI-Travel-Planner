import React from 'react';
import { Card, Typography, Space, Tag, Button, Timeline, Divider, Row, Col } from 'antd';
import {
    CalendarOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    StarOutlined,
    CloudOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { TripPlan } from '../types';

const { Title, Text, Paragraph } = Typography;

interface TripPlanResultProps {
    plan: TripPlan;
    onOptimize?: (type: 'time' | 'cost' | 'experience') => void;
    loading?: boolean;
}

/**
 * 行程规划结果展示组件
 * 显示AI生成的旅行路线和详细信息
 */
export const TripPlanResult: React.FC<TripPlanResultProps> = ({
    plan,
    onOptimize,
    loading = false
}) => {
    // 格式化费用显示
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(amount);
    };

    return (
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            {/* 行程概览 */}
            <Card
                title={
                    <Space>
                        <CalendarOutlined style={{ color: '#52c41a' }} />
                        <Title level={4} style={{ margin: 0 }}>行程概览</Title>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Space direction="vertical" size="small">
                            <Text type="secondary">行程天数</Text>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                {plan.itinerary.length} 天
                            </Title>
                        </Space>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Space direction="vertical" size="small">
                            <Text type="secondary">总预算</Text>
                            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                                {formatCurrency(plan.totalEstimatedCost)}
                            </Title>
                        </Space>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Space direction="vertical" size="small">
                            <Text type="secondary">日均费用</Text>
                            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                                {formatCurrency(Math.round(plan.totalEstimatedCost / plan.itinerary.length))}
                            </Title>
                        </Space>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Space direction="vertical" size="small">
                            <Text type="secondary">预算使用率</Text>
                            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
                                100%
                            </Title>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* 优化选项 */}
            {onOptimize && (
                <Card
                    title={
                        <Space>
                            <ReloadOutlined style={{ color: '#1890ff' }} />
                            <Text strong>行程优化</Text>
                        </Space>
                    }
                    style={{ marginBottom: 24 }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">根据您的需求优化行程：</Text>
                        <Space wrap>
                            <Button
                                type="default"
                                icon={<DollarOutlined />}
                                onClick={() => onOptimize('cost')}
                                loading={loading}
                            >
                                节省费用
                            </Button>
                            <Button
                                type="default"
                                icon={<CalendarOutlined />}
                                onClick={() => onOptimize('time')}
                                loading={loading}
                            >
                                优化时间
                            </Button>
                            <Button
                                type="default"
                                icon={<StarOutlined />}
                                onClick={() => onOptimize('experience')}
                                loading={loading}
                            >
                                提升体验
                            </Button>
                        </Space>
                    </Space>
                </Card>
            )}

            {/* 每日行程详情 */}
            <Card
                title={
                    <Space>
                        <EnvironmentOutlined style={{ color: '#fa541c' }} />
                        <Title level={4} style={{ margin: 0 }}>每日行程安排</Title>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                {plan.itinerary.map((day, index) => (
                    <div key={day.day} style={{ marginBottom: index < plan.itinerary.length - 1 ? 32 : 0 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                                <Tag color="blue" style={{ fontSize: '16px', padding: '4px 12px' }}>
                                    第 {day.day} 天
                                </Tag>
                                <Text type="secondary">{day.date}</Text>
                            </Space>

                            <Timeline>
                                {day.activities.map((activity, activityIndex) => (
                                    <Timeline.Item
                                        key={activityIndex}
                                        dot={
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: '#1890ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'white'
                                                }} />
                                            </div>
                                        }
                                    >
                                        <Card
                                            size="small"
                                            style={{
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e9ecef'
                                            }}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Space>
                                                    <Tag color="geekblue">{activity.time}</Tag>
                                                    <Text strong>{activity.activity}</Text>
                                                </Space>
                                                <Space>
                                                    <EnvironmentOutlined style={{ color: '#52c41a' }} />
                                                    <Text>{activity.location}</Text>
                                                </Space>
                                                <Space>
                                                    <DollarOutlined style={{ color: '#faad14' }} />
                                                    <Text>{formatCurrency(activity.estimatedCost)}</Text>
                                                </Space>
                                                <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                                                    {activity.description}
                                                </Paragraph>
                                            </Space>
                                        </Card>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </Space>

                        {index < plan.itinerary.length - 1 && <Divider />}
                    </div>
                ))}
            </Card>

            {/* 旅行建议 */}
            <Card
                title={
                    <Space>
                        <StarOutlined style={{ color: '#faad14' }} />
                        <Title level={4} style={{ margin: 0 }}>旅行建议</Title>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {plan.recommendations.map((recommendation, index) => (
                        <Space key={index} style={{ width: '100%' }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#1890ff',
                                marginRight: '8px'
                            }} />
                            <Text>{recommendation}</Text>
                        </Space>
                    ))}
                </Space>
            </Card>

            {/* 天气建议 */}
            <Card
                title={
                    <Space>
                        <CloudOutlined style={{ color: '#13c2c2' }} />
                        <Title level={4} style={{ margin: 0 }}>天气建议</Title>
                    </Space>
                }
            >
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {plan.weatherAdvice}
                </Paragraph>
            </Card>
        </div>
    );
};

export default TripPlanResult;