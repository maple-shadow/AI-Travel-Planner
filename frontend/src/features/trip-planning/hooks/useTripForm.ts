import { useState, useCallback } from 'react';
import { TripFormData, Trip } from '../types';

const initialFormData: TripFormData = {
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0
};

export const useTripForm = (initialTrip?: Trip) => {
    const [formData, setFormData] = useState<TripFormData>(() => {
        if (initialTrip) {
            return {
                title: initialTrip.title,
                description: initialTrip.description || '',
                destination: initialTrip.destination,
                startDate: initialTrip.startDate,
                endDate: initialTrip.endDate,
                budget: initialTrip.budget
            };
        }
        return initialFormData;
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // 处理表单字段变更
    const handleChange = useCallback((field: keyof TripFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 清除对应字段的错误
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [errors]);

    // 验证表单
    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = '行程标题不能为空';
        }

        if (!formData.startDate) {
            newErrors.startDate = '开始日期不能为空';
        }

        if (!formData.endDate) {
            newErrors.endDate = '结束日期不能为空';
        }

        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = '结束日期不能早于开始日期';
        }

        if (formData.budget < 0) {
            newErrors.budget = '预算不能为负数';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // 重置表单
    const resetForm = useCallback(() => {
        setFormData(initialTrip ? {
            title: initialTrip.title,
            description: initialTrip.description || '',
            destination: initialTrip.destination,
            startDate: initialTrip.startDate,
            endDate: initialTrip.endDate,
            budget: initialTrip.budget
        } : initialFormData);
        setErrors({});
    }, [initialTrip]);

    return {
        formData,
        errors,
        handleChange,
        validateForm,
        resetForm,
        setFormData
    };
};