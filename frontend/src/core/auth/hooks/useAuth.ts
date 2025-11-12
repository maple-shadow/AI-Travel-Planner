// 认证状态Hook
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    loginUser,
    registerUser,
    logout,
    validateToken,
    clearError
} from '../../store/authSlice';
import {
    UseAuthReturn,
    LoginCredentials,
    RegisterData
} from '../types/auth.types';

/**
 * 认证状态Hook
 * 提供认证状态、用户信息和认证操作
 */
export const useAuth = (): UseAuthReturn => {
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state: any) => state.auth);

    // 从Redux状态映射到Hook返回值
    const isAuthenticated = authState.isAuthenticated;
    const user = authState.user;
    const loading = authState.loading;
    const error = authState.error;

    // 登录操作
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            await dispatch(loginUser({
                email: credentials.email,
                password: credentials.password
            })).unwrap();
        } catch (error) {
            // 错误处理已经在Redux中处理
            throw error;
        }
    }, [dispatch]);

    // 注册操作
    const register = useCallback(async (data: RegisterData) => {
        try {
            await dispatch(registerUser({
                username: data.username,
                email: data.email,
                password: data.password
            })).unwrap();
        } catch (error) {
            throw error;
        }
    }, [dispatch]);

    // 登出操作
    const logoutHandler = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    // 刷新Token
    const refreshToken = useCallback(async () => {
        try {
            await dispatch(validateToken()).unwrap();
        } catch (error) {
            // Token刷新失败，自动登出
            dispatch(logout());
            throw error;
        }
    }, [dispatch]);

    // 清除错误
    const clearErrorHandler = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // 防抖验证token的函数
    const debouncedValidateToken = useCallback(() => {
        // 检查距离上次验证是否超过5分钟，避免频繁验证
        const lastValidation = localStorage.getItem('lastTokenValidation');
        const now = Date.now();

        if (!lastValidation || (now - parseInt(lastValidation)) > 5 * 60 * 1000) {
            dispatch(validateToken());
            localStorage.setItem('lastTokenValidation', now.toString());
        }
    }, [dispatch]);

    // 组件挂载时验证token（带防抖）
    useEffect(() => {
        const timer = setTimeout(debouncedValidateToken, 1000); // 延迟1秒执行
        return () => clearTimeout(timer);
    }, [debouncedValidateToken]);

    // 设置定期token刷新（带缓存检查）
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            // 检查距离上次验证是否超过25分钟，避免频繁刷新
            const lastValidation = localStorage.getItem('lastTokenValidation');
            const now = Date.now();

            if (!lastValidation || (now - parseInt(lastValidation)) > 25 * 60 * 1000) {
                refreshToken().catch(() => {
                    // 静默处理刷新失败
                });
                localStorage.setItem('lastTokenValidation', now.toString());
            }
        }, 30 * 60 * 1000); // 每30分钟刷新一次

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshToken]);

    return {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout: logoutHandler,
        refreshToken,
        clearError: clearErrorHandler
    };
};

/**
 * 检查认证状态的Hook
 * 用于需要认证状态的组件
 */
export const useAuthState = () => {
    const { isAuthenticated, user, loading } = useAuth();
    return { isAuthenticated, user, loading };
};

/**
 * 认证操作的Hook
 * 仅提供认证操作，不包含状态
 */
export const useAuthActions = () => {
    const { login, register, logout, refreshToken, clearError } = useAuth();
    return { login, register, logout, refreshToken, clearError };
};