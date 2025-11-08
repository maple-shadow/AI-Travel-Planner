// 路由配置器
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { allRoutes } from './routes';
import RouteGuard from './RouteGuard';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';
import { validateToken } from '../store/authSlice';

// 加载组件
const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
);

const RouterConfig: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // 应用启动时验证token（仅执行一次）
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && isAuthenticated) {
            // 检查距离上次验证是否超过5分钟，避免频繁验证
            const lastValidation = localStorage.getItem('lastTokenValidation');
            const now = Date.now();

            if (!lastValidation || (now - parseInt(lastValidation)) > 5 * 60 * 1000) {
                dispatch(validateToken());
                localStorage.setItem('lastTokenValidation', now.toString());
            }
        }
    }, [dispatch]); // 移除isAuthenticated依赖，避免重复触发

    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {allRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <RouteGuard route={route}>
                                    <route.component />
                                </RouteGuard>
                            }
                        />
                    ))}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default RouterConfig;