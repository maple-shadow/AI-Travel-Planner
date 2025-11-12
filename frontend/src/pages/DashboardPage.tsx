// 仪表板页面
import React from 'react';
import { useAppSelector } from '../core/store/hooks';
import { Link } from 'react-router-dom';
import { Card, Typography, Row, Col, Button } from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    HeartOutlined,
    PlusOutlined,
    SettingOutlined,
    CompassOutlined,
    UserOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div className="w-full max-w-6xl">
                <Card style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Title level={2} style={{ color: '#667eea', marginBottom: '8px' }}>
                            欢迎回来, {user?.name || '旅行者'}!
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            这是您的AI旅行规划器仪表板，开始规划您的下一次冒险吧
                        </Text>
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}
                                styles={{ body: { padding: '20px' } }}
                            >
                                <CalendarOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>3</div>
                                <div>进行中的行程</div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                    color: 'white'
                                }}
                                styles={{ body: { padding: '20px' } }}
                            >
                                <CheckCircleOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>5</div>
                                <div>已完成行程</div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                    color: 'white'
                                }}
                                styles={{ body: { padding: '20px' } }}
                            >
                                <DollarOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>¥2,500</div>
                                <div>本月预算</div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                                    color: 'white'
                                }}
                                styles={{ body: { padding: '20px' } }}
                            >
                                <HeartOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>12</div>
                                <div>收藏地点</div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} justify="center">
                        <Col xs={24} sm={12} md={6}>
                            <Link to="/trips">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    style={{ width: '100%', height: '60px', borderRadius: '8px' }}
                                >
                                    管理行程
                                </Button>
                            </Link>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Link to="/budgets">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SettingOutlined />}
                                    style={{ width: '100%', height: '60px', borderRadius: '8px' }}
                                >
                                    预算管理
                                </Button>
                            </Link>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Link to="/destinations">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CompassOutlined />}
                                    style={{ width: '100%', height: '60px', borderRadius: '8px' }}
                                >
                                    目的地探索
                                </Button>
                            </Link>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Link to="/profile">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UserOutlined />}
                                    style={{ width: '100%', height: '60px', borderRadius: '8px' }}
                                >
                                    个人资料
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;