import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../core/store';
import { loadTrips as fetchTrips, deleteTrip } from '../store/tripSlice';
import { Trip, TripStatus } from '../types';
import { TripList, TripForm, TripDetail } from '../components';
import { useTripActions } from '../hooks';

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
        dispatch(fetchTrips());
    }, [dispatch]);

    const filteredTrips = trips.filter(trip => {
        const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <TripDetail
                        trip={viewingTrip}
                        onEdit={() => handleEditTrip(viewingTrip)}
                        onBack={() => setViewingTrip(null)}
                    />
                </div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <TripForm
                        trip={editingTrip || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isLoading={loading}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* 页面标题和操作栏 */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">我的行程</h1>
                            <p className="text-gray-600 mt-2">管理您的旅行计划</p>
                        </div>
                        <button
                            onClick={handleCreateTrip}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            + 创建新行程
                        </button>
                    </div>

                    {/* 搜索和筛选栏 */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="搜索行程标题或目的地..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as TripStatus | 'all')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">所有状态</option>
                                    <option value={TripStatus.PLANNING}>规划中</option>
                                    <option value={TripStatus.IN_PROGRESS}>进行中</option>
                                    <option value={TripStatus.COMPLETED}>已完成</option>
                                    <option value={TripStatus.CANCELLED}>已取消</option>
                                </select>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                                共 {filteredTrips.length} 个行程
                            </div>
                        </div>
                    </div>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700">{error}</p>
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
            </div>
        </div>
    );
};

export default TripListPage;