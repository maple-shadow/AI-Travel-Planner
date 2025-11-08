// 认证状态组件
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthStatusProps {
    className?: string;
    showUserInfo?: boolean;
    showLogoutButton?: boolean;
}

/**
 * 认证状态组件
 * 显示当前用户的认证状态和用户信息
 */
export const AuthStatus: React.FC<AuthStatusProps> = ({
    className = '',
    showUserInfo = true,
    showLogoutButton = true
}) => {
    const { isAuthenticated, user, logout, loading } = useAuth();

    // 处理登出操作
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={`auth-status ${className}`}>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">未登录</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`auth-status ${className}`}>
            <div className="flex items-center space-x-3">
                {/* 认证状态指示器 */}
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">已登录</span>
                </div>

                {/* 用户信息 */}
                {showUserInfo && user && (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                                {user.name || '用户'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {user.email}
                            </span>
                        </div>
                    </div>
                )}

                {/* 登出按钮 */}
                {showLogoutButton && (
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? '登出中...' : '登出'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AuthStatus;