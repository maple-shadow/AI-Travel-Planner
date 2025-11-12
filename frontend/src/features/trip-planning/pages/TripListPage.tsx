import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../core/store';
import { loadTrips, deleteTrip } from '../store/tripSlice';
import { Trip, TripStatus } from '../types';
import { TripList, TripForm, TripDetail } from '../components';
import { useTripActions } from '../hooks';
import { Card, Typography, Row, Col, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const TripListPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { trips, loading, error } = useSelector((state: RootState) => state.trips);
    const { createNewTrip, updateTripDetails, duplicateTrip } = useTripActions();

    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');

    useEffect(() => {
        dispatch(loadTrips());
    }, [dispatch]);

    // 确保trips是数组类型，避免filter调用错误
    const filteredTrips = Array.isArray(trips) ? trips.filter(trip => {
        // 安全处理可能为undefined或null的title和destination字段
        const tripTitle = trip.title || '';
        const tripDestination = trip.destination || '';
        const matchesSearch = tripTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tripDestination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    const handleCreateTrip = () => {
        setEditingTrip(null);
        setShowForm(true);
    };

    const handleEditTrip = (trip: Trip) => {
        setEditingTrip(trip);
        setShowForm(true);
    };

    const handleDeleteTrip = async (tripId: string) => {
        if (window.confirm('确定要删除这个行程吗？此操作不可撤销。')) {
            try {
                await dispatch(deleteTrip(tripId)).unwrap();
            } catch (error) {
                console.error('删除行程失败:', error);
            }
        }
    };

    const handleDuplicateTrip = async (tripId: string) => {
        try {
            await duplicateTrip(tripId);
        } catch (error) {
            console.error('复制行程失败:', error);
        }
    };

    const handleViewTrip = (trip: Trip) => {
        setViewingTrip(trip);
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            if (editingTrip) {
                await updateTripDetails({ ...formData, id: editingTrip.id });
            } else {
                await createNewTrip(formData);
            }
            setShowForm(false);
            setEditingTrip(null);
        } catch (error) {
            console.error('保存行程失败:', error);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingTrip(null);
    };

    if (viewingTrip) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
            }}>
                <div className="w-full max-w-4xl">
                    <Card style={{
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                        <TripDetail
                            trip={viewingTrip}
                            onEdit={() => handleEditTrip(viewingTrip)}
                            onBack={() => setViewingTrip(null)}
                        />
                    </Card>
                </div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
            }}>
                <div className="w-full max-w-2xl">
                    <Card style={{
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                        <TripForm
                            trip={editingTrip || undefined}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                            isLoading={loading}
                        />
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div className="w-full max-w-7xl">
                <Card style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* 页面标题和操作栏 */}
                    <div style={{ marginBottom: '32px' }}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                            <Col>
                                <Title level={2} style={{ color: '#667eea', marginBottom: '8px' }}>我的行程</Title>
                                <Text type="secondary">管理您的旅行计划</Text>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateTrip}
                                    style={{ borderRadius: '8px' }}
                                >
                                    创建新行程
                                </Button>
                            </Col>
                        </Row>

                        {/* 搜索和筛选栏 */}
                        <Card styles={{ body: { padding: '20px' } }}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <Input
                                        placeholder="搜索行程标题或目的地..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        prefix={<SearchOutlined />}
                                        size="large"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Select
                                        value={statusFilter}
                                        onChange={(value) => setStatusFilter(value as TripStatus | 'all')}
                                        size="large"
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    >
                                        <Option value="all">所有状态</Option>
                                        <Option value={TripStatus.PLANNING}>规划中</Option>
                                        <Option value={TripStatus.IN_PROGRESS}>进行中</Option>
                                        <Option value={TripStatus.COMPLETED}>已完成</Option>
                                        <Option value={TripStatus.CANCELLED}>已取消</Option>
                                    </Select>
                                </Col>
                                <Col xs={24} sm={24} md={8}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '100%',
                                        justifyContent: 'center',
                                        color: '#666'
                                    }}>
                                        共 {filteredTrips.length} 个行程
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '8px'
                        }}>
                            <Text type="danger">{error}</Text>
                        </div>
                    )}

                    {/* 行程列表 */}
                    <TripList
                        trips={filteredTrips}
                        onEditTrip={handleEditTrip}
                        onDeleteTrip={handleDeleteTrip}
                        onDuplicateTrip={handleDuplicateTrip}
                        onViewTrip={handleViewTrip}
                        isLoading={loading && trips.length === 0}
                    />
                </Card>
            </div>
        </div>
    );
};

export default TripListPage;