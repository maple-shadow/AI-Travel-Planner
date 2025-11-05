// API客户端配置
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../../shared/utils';

// API基础配置
const API_BASE_URL = 'http://localhost:5000/api';

// 创建axios实例
const createApiClient = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // 请求拦截器
    instance.interceptors.request.use(
        (config) => {
            // 添加认证token
            const token = storage.get<string>('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        (error) => {
            console.error('Request Error:', error);
            return Promise.reject(error);
        }
    );

    // 响应拦截器
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            console.log(`API Response: ${response.status} ${response.config.url}`);
            return response;
        },
        (error) => {
            console.error('Response Error:', error.response?.data || error.message);

            // 处理认证错误
            if (error.response?.status === 401) {
                storage.remove('auth_token');
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

// API客户端实例
export const apiClient = createApiClient();

// API方法封装
export class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = createApiClient();
    }

    // GET请求
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    // POST请求
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    // PUT请求
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    // DELETE请求
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    // PATCH请求
    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }
}

// 默认API客户端实例
export const defaultApiClient = new ApiClient();

// 导出常用的API方法
export const api = {
    get: defaultApiClient.get.bind(defaultApiClient),
    post: defaultApiClient.post.bind(defaultApiClient),
    put: defaultApiClient.put.bind(defaultApiClient),
    delete: defaultApiClient.delete.bind(defaultApiClient),
    patch: defaultApiClient.patch.bind(defaultApiClient),
};