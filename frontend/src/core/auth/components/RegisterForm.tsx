// 注册表单组件
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types/auth.types';

interface RegisterFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    redirectTo?: string;
}

/**
 * 注册表单组件
 * 处理用户注册逻辑和UI展示
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
    onSuccess,
    onError,
    redirectTo = '/login'
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, loading, error, clearError } = useAuth();

    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    // 从路由状态获取重定向路径
    const from = (location.state as any)?.from?.pathname || redirectTo;

    // 清除错误信息
    useEffect(() => {
        if (error) {
            onError?.(error);
        }
    }, [error, onError]);

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // 清除对应字段的验证错误
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        // 清除全局错误
        if (error) {
            clearError();
        }
    };

    // 验证表单数据
    const validateForm = (): boolean => {
        const errors: {
            name?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        // 姓名验证
        if (!formData.name.trim()) {
            errors.name = '请输入姓名';
        } else if (formData.name.trim().length < 2) {
            errors.name = '姓名长度至少2位';
        }

        // 邮箱验证
        if (!formData.email.trim()) {
            errors.email = '请输入邮箱地址';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = '请输入有效的邮箱地址';
        }

        // 密码验证
        if (!formData.password) {
            errors.password = '请输入密码';
        } else if (formData.password.length < 6) {
            errors.password = '密码长度至少6位';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password = '密码必须包含大小写字母和数字';
        }

        // 确认密码验证
        if (!formData.confirmPassword) {
            errors.confirmPassword = '请确认密码';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = '两次输入的密码不一致';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await register(formData);

            // 注册成功回调
            onSuccess?.();

            // 重定向到登录页面
            navigate(from, {
                replace: true,
                state: {
                    message: '注册成功，请登录',
                    email: formData.email
                }
            });
        } catch (error) {
            // 错误处理已经在Hook中完成
            console.error('Register form submission failed:', error);
        }
    };

    // 处理登录跳转
    const handleLoginRedirect = () => {
        navigate('/login', { state: { from: location } });
    };

    // 密码强度指示器
    const getPasswordStrength = (password: string): { strength: string; color: string } => {
        if (!password) return { strength: '', color: 'gray' };

        let score = 0;
        if (password.length >= 6) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;

        switch (score) {
            case 0:
            case 1:
                return { strength: '弱', color: 'red' };
            case 2:
            case 3:
                return { strength: '中', color: 'orange' };
            case 4:
            case 5:
                return { strength: '强', color: 'green' };
            default:
                return { strength: '', color: 'gray' };
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="register-form">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 姓名输入 */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        姓名
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="请输入您的姓名"
                        disabled={loading}
                    />
                    {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                </div>

                {/* 邮箱输入 */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        邮箱地址
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="请输入邮箱地址"
                        disabled={loading}
                    />
                    {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                </div>

                {/* 密码输入 */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        密码
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.password ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="请输入密码"
                        disabled={loading}
                    />
                    {formData.password && (
                        <div className="mt-1">
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`h-1 flex-1 rounded-full bg-${passwordStrength.color}-300`}
                                    style={{
                                        backgroundColor: passwordStrength.color === 'red' ? '#fca5a5' :
                                            passwordStrength.color === 'orange' ? '#fdba74' : '#86efac'
                                    }}
                                />
                                <span className={`text-xs text-${passwordStrength.color}-600`}>
                                    {passwordStrength.strength}
                                </span>
                            </div>
                        </div>
                    )}
                    {validationErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                </div>

                {/* 确认密码输入 */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        确认密码
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="请再次输入密码"
                        disabled={loading}
                    />
                    {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                </div>

                {/* 错误信息显示 */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {/* 提交按钮 */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            注册中...
                        </>
                    ) : (
                        '注册'
                    )}
                </button>

                {/* 登录链接 */}
                <div className="text-center">
                    <span className="text-sm text-gray-600">已有账号？</span>
                    <button
                        type="button"
                        onClick={handleLoginRedirect}
                        className="ml-1 text-sm text-blue-600 hover:text-blue-500"
                        disabled={loading}
                    >
                        立即登录
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;