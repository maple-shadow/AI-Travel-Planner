// 路由守卫组件
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../shared/hooks';
import { RouteConfig } from '../../shared/types';

interface RouteGuardProps {
    route: RouteConfig;
    children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ route, children }) => {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // 设置页面标题 - 必须在条件渲染之前调用
    React.useEffect(() => {
        if (route.title) {
            document.title = route.title;
        }
    }, [route.title]);

    // 如果正在加载认证状态，显示加载指示器
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // 检查路由访问权限
    if (route.isPrivate && !isAuthenticated) {
        // 重定向到登录页面，并保存当前路径
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!route.isPrivate && isAuthenticated) {
        // 如果已认证但访问公开路由，重定向到首页
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default RouteGuard;