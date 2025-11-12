// 认证模块类型定义

// 认证状态变量
export interface AuthState {
    isAuthenticated: boolean;
    userInfo: User | null;
    authLoading: boolean;
    token: string | null;
    refreshToken: string | null;
    tokenExpiry: number | null;
    error: string | null;
}

// Token管理变量
export interface TokenStorage {
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
    storageType: 'localStorage' | 'sessionStorage';
}

// 用户信息
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

// 登录凭据
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// 注册信息
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// 认证响应
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
}

// 认证错误
export interface AuthError {
    code: string;
    message: string;
    details?: any;
}

// 路由守卫配置
export interface AuthGuardConfig {
    requireAuth: boolean;
    redirectTo?: string;
    fallback?: React.ReactNode;
}

// 认证Hook返回值
export interface UseAuthReturn {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    clearError: () => void;
}

// 认证操作Hook返回值
export interface UseAuthActionsReturn {
    handleLogin: (credentials: LoginCredentials) => Promise<void>;
    handleRegister: (data: RegisterData) => Promise<void>;
    handleLogout: () => void;
    refreshAuthToken: () => Promise<void>;
    validateAuthState: () => boolean;
}