import React from 'react';
import { Trip, TripStatus } from '../types';

interface TripDetailProps {
    trip: Trip;
    onEdit?: () => void;
    onBack?: () => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onEdit, onBack }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatBudget = (budget: number) => {
        return `¥${budget.toLocaleString()}`;
    };

    const getStatusColor = (status: TripStatus) => {
        switch (status) {
            case TripStatus.PLANNING:
                return 'bg-blue-100 text-blue-800';
            case TripStatus.IN_PROGRESS:
                return 'bg-green-100 text-green-800';
            case TripStatus.COMPLETED:
                return 'bg-gray-100 text-gray-800';
            case TripStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1; // 包含开始和结束日期的总天数
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ← 返回
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status)}
                    </span>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            编辑行程
                        </button>
                    )}
                </div>
            </div>

            {trip.description && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">行程描述</h3>
                    <p className="text-gray-600 leading-relaxed">{trip.description}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">目的地</h4>
                    <p className="text-lg font-semibold text-gray-900">{trip.destination}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">开始日期</h4>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(trip.startDate)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">结束日期</h4>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(trip.endDate)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">行程天数</h4>
                    <p className="text-lg font-semibold text-gray-900">
                        {calculateDuration(trip.startDate, trip.endDate)} 天
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">预算</h4>
                    <p className="text-2xl font-bold text-green-600">{formatBudget(trip.budget)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">创建时间</h4>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(trip.createdAt)}</p>
                </div>
            </div>

            {trip.updatedAt && trip.updatedAt !== trip.createdAt && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        最后更新: {formatDate(trip.updatedAt)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TripDetail;