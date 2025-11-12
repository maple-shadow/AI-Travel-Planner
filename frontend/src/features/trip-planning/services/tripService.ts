import { apiClient } from '../../../services/api-client/index';
import { Trip, CreateTripRequest, UpdateTripRequest, TripFilters } from '../types';
import { storage } from '../../../shared/utils';

const BASE_URL = '/trips';

// 将后端数据转换为前端格式
const transformTripData = (backendTrip: any): Trip => {
    return {
        id: backendTrip.id,
        title: backendTrip.title,
        description: backendTrip.description,
        destination: backendTrip.destination,
        startDate: backendTrip.start_date,
        endDate: backendTrip.end_date,
        budget: backendTrip.budget || 0,
        userId: backendTrip.user_id,
        status: backendTrip.status,
        createdAt: backendTrip.created_at,
        updatedAt: backendTrip.updated_at
    };
};

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

        // 转换后端数据格式
        if (response.data && response.data.data && Array.isArray(response.data.data.trips)) {
            return response.data.data.trips.map((trip: any) => transformTripData(trip));
        }

        return [];
    },

    // 根据ID获取行程
    async getTripById(id: string): Promise<Trip> {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return transformTripData(response.data);
    },

    // 创建新行程
    async createTrip(data: CreateTripRequest): Promise<Trip> {
        // 从本地存储获取当前用户信息
        const user = storage.get<any>('user_data');

        if (!user || !user.id) {
            throw new Error('用户未登录或用户信息不完整');
        }

        // 转换字段名为后端期望的格式
        const requestData = {
            user_id: user.id,
            title: data.title,
            description: data.description || '',
            destination: data.destination,
            start_date: data.startDate,
            end_date: data.endDate,
            budget: data.budget
        };

        const response = await apiClient.post(BASE_URL, requestData);
        // 转换后端返回的数据格式
        return transformTripData(response.data);
    },

    // 更新行程
    async updateTrip(data: UpdateTripRequest): Promise<Trip> {
        const response = await apiClient.put(`${BASE_URL}/${data.id}`, data);
        // 转换后端返回的数据格式
        return transformTripData(response.data);
    },

    // 删除行程
    async deleteTrip(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    // 复制行程
    async duplicateTrip(id: string): Promise<Trip> {
        const response = await apiClient.post(`${BASE_URL}/${id}/duplicate`);
        // 转换后端返回的数据格式
        return transformTripData(response.data);
    }
};