import React from 'react';
import { Trip, TripStatus } from '../types';

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
        return new Date(dateString).toLocaleDateString('zh-CN');
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

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 truncate">{trip.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                    {getStatusText(trip.status)}
                </span>
            </div>

            {trip.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <span className="text-sm text-gray-500">开始日期</span>
                    <p className="font-medium">{formatDate(trip.startDate)}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-500">结束日期</span>
                    <p className="font-medium">{formatDate(trip.endDate)}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-500">预算</span>
                    <p className="font-medium">{formatBudget(trip.budget)}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-500">创建时间</span>
                    <p className="font-medium">{formatDate(trip.createdAt)}</p>
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                {onView && (
                    <button
                        onClick={() => onView(trip)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        查看详情
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={() => onEdit(trip)}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        编辑
                    </button>
                )}
                {onDuplicate && (
                    <button
                        onClick={() => onDuplicate(trip.id)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        复制
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(trip.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        删除
                    </button>
                )}
            </div>
        </div>
    );
};

export default TripCard;