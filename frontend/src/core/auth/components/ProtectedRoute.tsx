// 认证保护路由组件
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    fallbackPath?: string;
}

/**
 * 认证保护路由组件
 * 保护需要认证才能访问的路由
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    fallbackPath = '/login'
}) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // 如果正在加载认证状态，显示加载指示器
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // 如果未认证，重定向到登录页面
    if (!isAuthenticated) {
        return (
            <Navigate
                to={fallbackPath}
                state={{
                    from: location,
                    message: '请先登录以访问该页面'
                }}
                replace
            />
        );
    }

    // 如果要求特定角色但用户没有该角色
    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">权限不足</h2>
                    <p className="text-gray-600 mb-4">
                        您没有访问此页面的权限。需要 {requiredRole} 角色。
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        返回
                    </button>
                </div>
            </div>
        );
    }

    // 认证通过，渲染子组件
    return <>{children}</>;
};

export default ProtectedRoute;