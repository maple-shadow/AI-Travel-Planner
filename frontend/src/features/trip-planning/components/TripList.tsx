import React from 'react';
import { Trip } from '../types';
import TripCard from './TripCard';

interface TripListProps {
    trips: Trip[];
    onEditTrip: (trip: Trip) => void;
    onDeleteTrip: (tripId: string) => void;
    onDuplicateTrip: (tripId: string) => void;
    onViewTrip: (trip: Trip) => void;
    isLoading?: boolean;
}

const TripList: React.FC<TripListProps> = ({
    trips,
    onEditTrip,
    onDeleteTrip,
    onDuplicateTrip,
    onViewTrip,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✈️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无行程</h3>
                <p className="text-gray-500">开始创建您的第一个旅行计划吧！</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
                <TripCard
                    key={trip.id}
                    trip={trip}
                    onEdit={onEditTrip}
                    onDelete={onDeleteTrip}
                    onDuplicate={onDuplicateTrip}
                    onView={onViewTrip}
                />
            ))}
        </div>
    );
};

export default TripList;