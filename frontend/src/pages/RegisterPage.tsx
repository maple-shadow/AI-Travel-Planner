// 注册页面
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '../core/auth';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 从路由状态获取重定向路径
    const from = (location.state as any)?.from?.pathname || '/login';

    // 处理注册成功
    const handleRegisterSuccess = () => {
        navigate(from, {
            replace: true,
            state: { message: '注册成功，请登录' }
        });
    };

    // 处理注册错误
    const handleRegisterError = (error: string) => {
        console.error('Registration failed:', error);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        注册新账户
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        或{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            登录现有账户
                        </button>
                    </p>
                </div>

                {/* 使用认证模块的注册表单组件 */}
                <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onError={handleRegisterError}
                    redirectTo={from}
                />
            </div>
        </div>
    );
};

export default RegisterPage;