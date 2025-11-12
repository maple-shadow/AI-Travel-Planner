import React from 'react';
import { Trip, TripStatus } from '../types';
import { Card, Typography, Button, Row, Col, Tag, Space } from 'antd';
import { EditOutlined, ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface TripDetailProps {
    trip: Trip;
    onEdit?: () => void;
    onBack?: () => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onEdit, onBack }) => {
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('YYYY年MM月DD日');
    };

    const formatBudget = (budget: number) => {
        return `¥${budget.toLocaleString()}`;
    };

    const getStatusColor = (status: TripStatus) => {
        switch (status) {
            case TripStatus.PLANNING:
                return 'blue';
            case TripStatus.IN_PROGRESS:
                return 'green';
            case TripStatus.COMPLETED:
                return 'gray';
            case TripStatus.CANCELLED:
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: TripStatus) => {
        switch (status) {
            case TripStatus.PLANNING:
                return '规划中';
            case TripStatus.IN_PROGRESS:
                return '进行中';
            case TripStatus.COMPLETED:
                return '已完成';
            case TripStatus.CANCELLED:
                return '已取消';
            default:
                return '未知';
        }
    };

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return end.diff(start, 'day') + 1; // 包含开始和结束日期的总天数
    };

    return (
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* 头部信息 */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {onBack && (
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={onBack}
                                style={{ color: '#666' }}
                            >
                                返回
                            </Button>
                        )}
                        <Title level={2} style={{ margin: 0 }}>{trip.title}</Title>
                    </div>
                    <Space>
                        <Tag color={getStatusColor(trip.status)}>
                            {getStatusText(trip.status)}
                        </Tag>
                        {onEdit && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={onEdit}
                            >
                                编辑行程
                            </Button>
                        )}
                    </Space>
                </div>

                {trip.description && (
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">{trip.description}</Text>
                    </div>
                )}
            </div>

            {/* 基本信息卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                        <EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>目的地</Text>
                        <Text>{trip.destination}</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                        <CalendarOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>开始日期</Text>
                        <Text>{formatDate(trip.startDate)}</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                        <CalendarOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>结束日期</Text>
                        <Text>{formatDate(trip.endDate)}</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                        <ClockCircleOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>行程天数</Text>
                        <Text>{calculateDuration(trip.startDate, trip.endDate)} 天</Text>
                    </Card>
                </Col>
            </Row>

            {/* 预算和创建时间 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card size="small">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <DollarOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>预算</Text>
                                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                                    {formatBudget(trip.budget)}
                                </Title>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card size="small">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>创建时间</Text>
                                <Text>{formatDate(trip.createdAt)}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 最后更新时间 */}
            {trip.updatedAt && trip.updatedAt !== trip.createdAt && (
                <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Text type="secondary">
                        最后更新: {formatDate(trip.updatedAt)}
                    </Text>
                </div>
            )}
        </Card>
    );
};

export default TripDetail;