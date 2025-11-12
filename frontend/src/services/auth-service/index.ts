// 认证服务
import { api } from '../api-client';
import { storage } from '../../shared/utils';
import { User } from '../../shared/types';

// 认证相关接口
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// 认证服务类
export class AuthService {
    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly USER_KEY = 'user_data';

    // 登录
    static async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<any>('/auth/login', credentials);
            // 后端返回格式为 { success, message, data: { user, token } }
            const authData = response.data;
            this.setAuthData(authData);
            return authData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // 注册
    static async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<any>('/auth/register', userData);
            // 后端返回格式为 { success, message, data: { user, token } }
            const authData = response.data;
            this.setAuthData(authData);
            return authData;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    // 登出
    static logout(): void {
        storage.remove(this.TOKEN_KEY);
        storage.remove(this.USER_KEY);
    }

    // 获取当前用户
    static getCurrentUser(): User | null {
        return storage.get<User>(this.USER_KEY);
    }

    // 获取认证token
    static getToken(): string | null {
        return storage.get<string>(this.TOKEN_KEY);
    }

    // 检查是否已认证
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // 刷新token
    static async refreshToken(): Promise<string> {
        try {
            const response = await api.post<{ token: string }>('/auth/refresh');
            this.setToken(response.token);
            return response.token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            throw error;
        }
    }

    // 更新用户信息
    static async updateUser(userData: Partial<User>): Promise<User> {
        try {
            const response = await api.put<User>('/auth/profile', userData);
            this.setUser(response);
            return response;
        } catch (error) {
            console.error('User update failed:', error);
            throw error;
        }
    }

    // 重置密码
    static async resetPassword(email: string): Promise<void> {
        try {
            await api.post('/auth/reset-password', { email });
        } catch (error) {
            console.error('Password reset failed:', error);
            throw error;
        }
    }

    // 验证token
    static async validateToken(): Promise<boolean> {
        try {
            await api.get('/auth/verify');
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    // 设置认证数据
    private static setAuthData(authData: any): void {
        // 后端返回格式为 { success, message, data: { user, token } }
        if (authData.data && authData.data.user && authData.data.token) {
            this.setToken(authData.data.token);
            this.setUser(authData.data.user);
        } else {
            // 兼容直接传入 { user, token } 的情况
            this.setToken(authData.token);
            this.setUser(authData.user);
        }
    }

    // 设置token
    private static setToken(token: string): void {
        storage.set(this.TOKEN_KEY, token);
    }

    // 设置用户数据
    private static setUser(user: User): void {
        storage.set(this.USER_KEY, user);
    }
}

// 导出认证服务实例
export default AuthService;