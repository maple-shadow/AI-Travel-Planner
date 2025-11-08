import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../core/store';
import { tripService } from '../services';
import { Trip, CreateTripRequest, UpdateTripRequest } from '../types';
import { addTrip, updateTrip as updateTripInStore, removeTrip } from '../store/tripSlice';

export const useTripActions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 创建新行程
    const createNewTrip = useCallback(async (tripData: CreateTripRequest): Promise<Trip | null> => {
        setLoading(true);
        setError(null);

        try {
            const newTrip = await tripService.createTrip(tripData);
            dispatch(addTrip(newTrip));
            return newTrip;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '创建行程失败';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    // 更新行程详情
    const updateTripDetails = useCallback(async (tripData: UpdateTripRequest): Promise<Trip | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedTrip = await tripService.updateTrip(tripData);
            dispatch(updateTripInStore(updatedTrip));
            return updatedTrip;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '更新行程失败';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    // 删除行程
    const deleteTrip = useCallback(async (tripId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await tripService.deleteTrip(tripId);
            dispatch(removeTrip(tripId));
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '删除行程失败';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    // 复制行程
    const duplicateTrip = useCallback(async (tripId: string): Promise<Trip | null> => {
        setLoading(true);
        setError(null);

        try {
            const duplicatedTrip = await tripService.duplicateTrip(tripId);
            dispatch(addTrip(duplicatedTrip));
            return duplicatedTrip;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '复制行程失败';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    // 清除错误
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        createNewTrip,
        updateTripDetails,
        deleteTrip,
        duplicateTrip,
        clearError
    };
};