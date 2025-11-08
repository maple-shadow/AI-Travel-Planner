import { apiClient } from '../../../services/api-client';
import { Trip, CreateTripRequest, UpdateTripRequest, TripFilters } from '../types';

const BASE_URL = '/api/trips';

export const tripService = {
    // 获取行程列表
    async getTrips(filters?: TripFilters): Promise<Trip[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.search) params.append('search', filters.search);

        const queryString = params.toString();
        const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

        const response = await apiClient.get(url);
        return response.data;
    },

    // 根据ID获取行程详情
    async getTripById(id: string): Promise<Trip> {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // 创建新行程
    async createTrip(data: CreateTripRequest): Promise<Trip> {
        const response = await apiClient.post(BASE_URL, data);
        return response.data;
    },

    // 更新行程
    async updateTrip(data: UpdateTripRequest): Promise<Trip> {
        const response = await apiClient.put(`${BASE_URL}/${data.id}`, data);
        return response.data;
    },

    // 删除行程
    async deleteTrip(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    // 复制行程
    async duplicateTrip(id: string): Promise<Trip> {
        const response = await apiClient.post(`${BASE_URL}/${id}/duplicate`);
        return response.data;
    }
};