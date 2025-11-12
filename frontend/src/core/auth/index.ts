// 认证模块主入口文件
// 导出所有认证相关的组件、Hook和类型

// 导出类型定义
export type { AuthState, User, LoginCredentials, RegisterData } from './types/auth.types';

// 导出Hook
export { useAuth, useAuthState, useAuthActions } from './hooks/useAuth';

// 导出组件
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { AuthStatus } from './components/AuthStatus';
export { ProtectedRoute } from './components/ProtectedRoute';

// 导出认证服务相关
export { AuthService } from '../../services/auth-service';

// 导出认证状态管理
export {
    loginUser,
    registerUser,
    validateToken,
    clearError,
    setAuthenticated,
    setUser,
    logout
} from '../store/authSlice';

/**
 * 认证模块配置接口
 */
export interface AuthModuleConfig {
    // 登录后重定向路径
    loginRedirectPath?: string;
    // 注册后重定向路径
    registerRedirectPath?: string;
    // 登出后重定向路径
    logoutRedirectPath?: string;
    // Token刷新间隔（毫秒）
    tokenRefreshInterval?: number;
    // 是否自动刷新Token
    autoRefreshToken?: boolean;
}

/**
 * 默认认证模块配置
 */
export const defaultAuthConfig: AuthModuleConfig = {
    loginRedirectPath: '/dashboard',
    registerRedirectPath: '/login',
    logoutRedirectPath: '/',
    tokenRefreshInterval: 15 * 60 * 1000, // 15分钟
    autoRefreshToken: true
};

/**
 * 初始化认证模块
 * @param config 认证模块配置
 */
export const initializeAuthModule = (config: Partial<AuthModuleConfig> = {}) => {
    const finalConfig = { ...defaultAuthConfig, ...config };

    console.log('认证模块初始化完成', finalConfig);

    return {
        config: finalConfig,
        // 这里可以添加模块初始化逻辑
        // 例如：设置Token自动刷新、验证初始认证状态等
    };
};

/**
 * 认证模块版本信息
 */
export const AUTH_MODULE_VERSION = '1.0.0';

/**
 * 认证模块功能描述
 */
export const AUTH_MODULE_DESCRIPTION = {
    name: '前端认证模块',
    version: AUTH_MODULE_VERSION,
    features: [
        '用户登录/注册',
        '认证状态管理',
        'Token自动刷新',
        '路由保护',
        '用户信息管理'
    ],
    dependencies: [
        'React',
        'Redux Toolkit',
        'React Router',
        'Axios'
    ]
};

// 导入组件用于默认导出
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { AuthStatus } from './components/AuthStatus';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

export default {
    // 组件
    LoginForm,
    RegisterForm,
    AuthStatus,
    ProtectedRoute,

    // Hook
    useAuth,

    // 配置
    initializeAuthModule,
    defaultAuthConfig,

    // 信息
    AUTH_MODULE_VERSION,
    AUTH_MODULE_DESCRIPTION
};