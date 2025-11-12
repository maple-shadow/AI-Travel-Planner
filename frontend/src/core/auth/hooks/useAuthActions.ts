// 认证操作Hook
import { useCallback } from 'react';
import { useAppDispatch } from '../../../shared/hooks';
import {
    loginUser,
    registerUser,
    logout,
    validateToken
} from '../../store/authSlice';
import {
    UseAuthActionsReturn,
    LoginCredentials,
    RegisterData
} from '../types/auth.types';

/**
 * 认证操作Hook
 * 专门处理认证相关的操作逻辑
 */
export const useAuthActions = (): UseAuthActionsReturn => {
    const dispatch = useAppDispatch();

    /**
     * 处理用户登录
     * @param credentials 登录凭据
     */
    const handleLogin = useCallback(async (credentials: LoginCredentials) => {
        try {
            await dispatch(loginUser({
                email: credentials.email,
                password: credentials.password
            })).unwrap();

            // 处理"记住我"选项
            if (credentials.rememberMe) {
                // 设置长期存储的token
                localStorage.setItem('auth_remember', 'true');
            } else {
                localStorage.removeItem('auth_remember');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, [dispatch]);

    /**
     * 处理用户注册
     * @param data 注册数据
     */
    const handleRegister = useCallback(async (data: RegisterData) => {
        try {
            // 验证密码确认
            if (data.password !== data.confirmPassword) {
                throw new Error('密码确认不匹配');
            }

            await dispatch(registerUser({
                username: data.username,
                email: data.email,
                password: data.password
            })).unwrap();
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }, [dispatch]);

    /**
     * 处理用户登出
     */
    const handleLogout = useCallback(() => {
        try {
            // 清除所有认证相关存储
            localStorage.removeItem('auth_remember');
            sessionStorage.clear();

            // 执行登出操作
            dispatch(logout());

            // 重定向到登录页面
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [dispatch]);

    /**
     * 刷新认证Token
     */
    const refreshAuthToken = useCallback(async () => {
        try {
            await dispatch(validateToken()).unwrap();
        } catch (error) {
            console.error('Token refresh failed:', error);

            // Token刷新失败，执行登出
            handleLogout();
            throw error;
        }
    }, [dispatch, handleLogout]);

    /**
     * 验证认证状态
     * @returns 是否有效认证
     */
    const validateAuthState = useCallback((): boolean => {
        try {
            // 检查token是否存在且未过期
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

            if (!token) {
                return false;
            }

            // 检查token过期时间（简化验证，实际应该解析JWT）
            const tokenExpiry = localStorage.getItem('token_expiry') || sessionStorage.getItem('token_expiry');
            if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Auth state validation failed:', error);
            return false;
        }
    }, []);



    return {
        handleLogin,
        handleRegister,
        handleLogout,
        refreshAuthToken,
        validateAuthState
    };
};

/**
 * 简化的认证操作Hook
 * 仅包含核心操作
 */
export const useSimpleAuthActions = () => {
    const { handleLogin, handleRegister, handleLogout } = useAuthActions();
    return { handleLogin, handleRegister, handleLogout };
};

/**
 * Token管理Hook
 * 专门处理Token相关操作
 */
export const useTokenManagement = () => {
    const { refreshAuthToken, validateAuthState } = useAuthActions();

    /**
     * 检查Token是否需要刷新
     */
    const shouldRefreshToken = useCallback((): boolean => {
        const tokenExpiry = localStorage.getItem('token_expiry') || sessionStorage.getItem('token_expiry');
        if (!tokenExpiry) return false;

        // 在过期前5分钟开始刷新
        const expiryTime = parseInt(tokenExpiry);
        const refreshThreshold = 5 * 60 * 1000; // 5分钟

        return Date.now() > (expiryTime - refreshThreshold);
    }, []);

    /**
     * 自动刷新Token（如果需要）
     */
    const autoRefreshToken = useCallback(async (): Promise<boolean> => {
        if (!shouldRefreshToken()) {
            return false;
        }

        try {
            await refreshAuthToken();
            return true;
        } catch (error) {
            console.error('Auto token refresh failed:', error);
            return false;
        }
    }, [shouldRefreshToken, refreshAuthToken]);

    return {
        shouldRefreshToken,
        autoRefreshToken,
        refreshAuthToken,
        validateAuthState
    };
};