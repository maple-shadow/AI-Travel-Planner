// 应用状态类型定义
export interface AppState {
    auth: AuthState;
    user: UserState;
    ui: UIState;
}

// Redux相关类型
export interface AsyncThunkConfig {
    state: AppState;
    rejectValue: string;
}

// 认证状态
export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
}

// 认证响应类型
export interface AuthResponse {
    user: User;
    token: string;
}

// 用户状态
export interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// UI状态
export interface UIState {
    theme: 'light' | 'dark';
    language: string;
    isLoading: boolean;
    notifications: Notification[];
}

// 用户数据类型
export interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

// 通知类型
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
}

// 路由配置类型
export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    exact?: boolean;
    isPrivate?: boolean;
    title?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// 分页参数
export interface PaginationParams {
    page: number;
    limit: number;
}

// 分页响应
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}