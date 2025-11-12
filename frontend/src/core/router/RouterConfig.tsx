// 路由配置器
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { allRoutes } from './routes';
import RouteGuard from './RouteGuard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { validateToken } from '../store/authSlice';
import Layout from '../../shared/components/Layout';
import AuthService from '../../services/auth-service';

// 加载组件
const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
);

const RouterConfig: React.FC = () => {
    const dispatch = useAppDispatch();
    const { loading: _loading } = useAppSelector((state) => state.auth);
    const [isPersistLoaded, setIsPersistLoaded] = React.useState(false);

    // 监听Redux持久化状态恢复完成
    React.useEffect(() => {
        // 检查Redux持久化是否已完成
        const checkPersistState = () => {
            const persistState = localStorage.getItem('persist:root');
            if (persistState) {
                try {
                    const parsed = JSON.parse(persistState);
                    if (parsed.auth) {
                        setIsPersistLoaded(true);
                        return;
                    }
                } catch (error) {
                    console.warn('解析持久化状态失败:', error);
                }
            }
            // 如果没有持久化状态，也视为加载完成
            setIsPersistLoaded(true);
        };

        // 延迟检查，确保Redux持久化有足够时间恢复
        const timer = setTimeout(checkPersistState, 500);
        return () => clearTimeout(timer);
    }, []);

    // 应用启动时验证token（仅在持久化状态恢复后执行）
    React.useEffect(() => {
        if (!isPersistLoaded) return;

        // 使用AuthService检查token，确保键名一致
        const token = AuthService.getToken();
        if (token) {
            // 检查距离上次验证是否超过5分钟，避免频繁验证
            const lastValidation = localStorage.getItem('lastTokenValidation');
            const now = Date.now();

            if (!lastValidation || (now - parseInt(lastValidation)) > 5 * 60 * 1000) {
                dispatch(validateToken());
                localStorage.setItem('lastTokenValidation', now.toString());
            }
            // 注意：Redux持久化会自动恢复认证状态，不需要手动设置
        }
    }, [dispatch, isPersistLoaded]); // 依赖持久化加载状态

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
                                    {route.isPrivate ? (
                                        <Layout>
                                            <route.component />
                                        </Layout>
                                    ) : (
                                        <route.component />
                                    )}
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