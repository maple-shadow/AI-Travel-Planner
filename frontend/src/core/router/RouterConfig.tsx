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

    // 应用启动时验证token
    React.useEffect(() => {
        if (isAuthenticated) {
            dispatch(validateToken());
        }
    }, [dispatch, isAuthenticated]);

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