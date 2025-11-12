import React from 'react';
import { Trip, TripStatus } from '../types';
import { Card, Typography, Button, Space, Tag, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface TripCardProps {
    trip: Trip;
    onEdit?: (trip: Trip) => void;
    onDelete?: (tripId: string) => void;
    onDuplicate?: (tripId: string) => void;
    onView?: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({
    trip,
    onEdit,
    onDelete,
    onDuplicate,
    onView
}) => {
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('MM/DD');
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

    return (
        <Card
            hoverable
            style={{ height: '100%' }}
            bodyStyle={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            {/* 头部信息 */}
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Title level={4} style={{ margin: 0, flex: 1, marginRight: 8 }} ellipsis={{ tooltip: trip.title }}>
                    {trip.title}
                </Title>
                <Tag color={getStatusColor(trip.status)}>
                    {getStatusText(trip.status)}
                </Tag>
            </div>

            {/* 描述信息 */}
            {trip.description && (
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }} ellipsis={{ tooltip: trip.description }}>
                    {trip.description}
                </Text>
            )}

            {/* 基本信息 */}
            <Row gutter={[8, 8]} style={{ marginBottom: 16, flex: 1 }}>
                <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined style={{ color: '#1890ff' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>开始</Text>
                    </div>
                    <Text strong>{formatDate(trip.startDate)}</Text>
                </Col>
                <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined style={{ color: '#fa8c16' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>结束</Text>
                    </div>
                    <Text strong>{formatDate(trip.endDate)}</Text>
                </Col>
                <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>预算</Text>
                    </div>
                    <Text strong style={{ color: '#52c41a' }}>{formatBudget(trip.budget)}</Text>
                </Col>
                <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined style={{ color: '#666' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>创建</Text>
                    </div>
                    <Text strong>{formatDate(trip.createdAt)}</Text>
                </Col>
            </Row>

            {/* 操作按钮 */}
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                {onView && (
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onView(trip)}
                    >
                        查看
                    </Button>
                )}
                {onEdit && (
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(trip)}
                    >
                        编辑
                    </Button>
                )}
                {onDuplicate && (
                    <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => onDuplicate(trip.id)}
                    >
                        复制
                    </Button>
                )}
                {onDelete && (
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(trip.id)}
                    >
                        删除
                    </Button>
                )}
            </Space>
        </Card>
    );
};

export default TripCard;