// 404错误页面
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, FrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card
                style={{
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div className="text-center">
                    {/* 404图标 */}
                    <FrownOutlined style={{ fontSize: '80px', color: '#667eea', marginBottom: '24px' }} />

                    {/* 标题 */}
                    <Title level={1} style={{ fontSize: '120px', margin: 0, color: '#667eea', lineHeight: 1 }}>
                        404
                    </Title>

                    <Title level={3} style={{ marginTop: '16px', marginBottom: '8px', color: '#1f2937' }}>
                        页面未找到
                    </Title>

                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        抱歉，您访问的页面不存在。
                    </Text>

                    {/* 操作按钮 */}
                    <Space size="middle" style={{ marginTop: '32px' }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<HomeOutlined />}
                            onClick={() => navigate('/dashboard')}
                        >
                            返回仪表板
                        </Button>
                        <Button
                            size="large"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
                        >
                            返回上页
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default NotFoundPage;