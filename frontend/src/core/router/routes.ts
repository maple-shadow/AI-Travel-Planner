// 路由配置
import { lazy } from 'react';
import { RouteConfig } from '../../shared/types';

// 懒加载页面组件
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'));
const TripListPage = lazy(() => import('../../features/trip-planning/pages/TripListPage'));

// 公开路由（无需认证）
export const publicRoutes: RouteConfig[] = [
    {
        path: '/login',
        component: LoginPage,
        exact: true,
        isPrivate: false,
        title: '登录 - AI旅行规划器',
    },
    {
        path: '/register',
        component: RegisterPage,
        exact: true,
        isPrivate: false,
        title: '注册 - AI旅行规划器',
    },
];

// 私有路由（需要认证）
export const privateRoutes: RouteConfig[] = [
    {
        path: '/',
        component: DashboardPage,
        exact: true,
        isPrivate: true,
        title: '仪表板 - AI旅行规划器',
    },
    {
        path: '/dashboard',
        component: DashboardPage,
        exact: true,
        isPrivate: true,
        title: '仪表板 - AI旅行规划器',
    },
    {
        path: '/profile',
        component: ProfilePage,
        exact: true,
        isPrivate: true,
        title: '个人资料 - AI旅行规划器',
    },
    {
        path: '/trips',
        component: TripListPage,
        exact: true,
        isPrivate: true,
        title: '我的行程 - AI旅行规划器',
    },
];

// 错误路由
const errorRoutes: RouteConfig[] = [
    {
        path: '*',
        component: NotFoundPage,
        exact: false,
        isPrivate: false,
        title: '页面未找到 - AI旅行规划器',
    },
];

// 所有路由
export const allRoutes: RouteConfig[] = [
    ...publicRoutes,
    ...privateRoutes,
    ...errorRoutes,
];

// 路由配置对象
export const routerConfig = {
    publicRoutes,
    privateRoutes,
    allRoutes,
    defaultRoute: '/dashboard',
    loginRoute: '/login',
    homeRoute: '/',
};