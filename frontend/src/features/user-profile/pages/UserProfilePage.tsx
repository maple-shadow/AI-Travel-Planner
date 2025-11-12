// 用户资料管理主页面
import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Tabs } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useProfile } from '../hooks';
import { ProfileAvatar, ProfileDisplay, ProfileForm, SettingsForm } from '../components';

const { Title, Text } = Typography;

const UserProfilePage: React.FC = () => {
    const {
        userProfile,
        isEditing,
        loading,
        error,
        setIsEditing,
        fetchUserProfile
    } = useProfile();

    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Card style={{ maxWidth: 400, width: '100%' }}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">加载中...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Card style={{ maxWidth: 400, width: '100%' }}>
                    <div className="text-center">
                        <div className="text-red-500 text-lg font-medium">加载失败</div>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={fetchUserProfile}
                            className="mt-4"
                        >
                            重试
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ maxWidth: 1200, width: '100%', padding: '20px' }}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
                    {/* 页面标题 */}
                    <div className="text-center mb-8">
                        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                            <UserOutlined style={{ marginRight: 8 }} />
                            个人中心
                        </Title>
                        <Text type="secondary">管理您的个人资料和账户设置</Text>
                    </div>

                    {/* 标签页导航 */}
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as 'profile' | 'settings')}
                        centered
                        size="large"
                        items={[
                            {
                                key: 'profile',
                                label: (
                                    <span>
                                        <UserOutlined />
                                        个人资料
                                    </span>
                                ),
                            },
                            {
                                key: 'settings',
                                label: (
                                    <span>
                                        <SettingOutlined />
                                        设置
                                    </span>
                                ),
                            },
                        ]}
                    />

                    {/* 内容区域 */}
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                        {/* 侧边栏 - 头像和基本信息 */}
                        <Col xs={24} lg={8}>
                            <Card>
                                <div className="text-center">
                                    <ProfileAvatar size="xl" editable={activeTab === 'profile'} />
                                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                                        {userProfile?.name || '用户'}
                                    </Title>
                                    <Text type="secondary">{userProfile?.email}</Text>

                                    {/* 会员状态 */}
                                    <div style={{ marginTop: 16 }}>
                                        <Button type="primary" size="small" ghost>
                                            普通会员
                                        </Button>
                                    </div>

                                    {/* 统计信息 */}
                                    <Row gutter={[8, 8]} style={{ marginTop: 24 }}>
                                        <Col span={8}>
                                            <div className="text-center">
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {userProfile?.travelCount || 0}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>旅行</div>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="text-center">
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {userProfile?.favoriteCount || 0}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>收藏</div>
                                            </div>
                                        </Col>
                                        <Col span={8}>
                                            <div className="text-center">
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {userProfile?.reviewCount || 0}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>评价</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>

                        {/* 主内容区域 */}
                        <Col xs={24} lg={16}>
                            {activeTab === 'profile' ? (
                                <Card>
                                    {isEditing ? (
                                        <ProfileForm onSave={handleSave} onCancel={handleCancel} />
                                    ) : (
                                        <ProfileDisplay onEdit={handleEditClick} />
                                    )}
                                </Card>
                            ) : (
                                <Card>
                                    <SettingsForm />
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default UserProfilePage;