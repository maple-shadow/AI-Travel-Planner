import { lazy } from 'react';

// 懒加载页面组件
const AuthPage = lazy(() => import('../../pages/AuthPage'));
const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'));
const TripListPage = lazy(() => import('../../features/trip-planning/pages/TripListPage'));
const BudgetManagerPage = lazy(() => import('../../features/budget-manager/pages/BudgetManagerPage'));
const MapNavigationPage = lazy(() => import('../../features/map-navigation/pages/MapNavigationPage'));
const AITripPlannerPage = lazy(() => import('../../features/ai-trip-planner/pages/AITripPlannerPage'));

// 路由配置接口
export interface RouteConfig {
    path: string;
    component: React.ComponentType<any>;
    isPrivate?: boolean;
    exact?: boolean;
    title?: string;
}

// 路由配置数组
export const allRoutes: RouteConfig[] = [
    {
        path: '/',
        component: AuthPage,
        isPrivate: false,
        exact: true,
        title: '登录/注册'
    },
    {
        path: '/auth',
        component: AuthPage,
        isPrivate: false,
        title: '登录/注册'
    },
    {
        path: '/dashboard',
        component: DashboardPage,
        isPrivate: true,
        title: '仪表板'
    },
    {
        path: '/profile',
        component: ProfilePage,
        isPrivate: true,
        title: '个人资料'
    },
    {
        path: '/trips',
        component: TripListPage,
        isPrivate: true,
        title: '我的行程'
    },
    {
        path: '/budgets',
        component: BudgetManagerPage,
        isPrivate: true,
        title: '预算管理'
    },
    {
        path: '/map',
        component: MapNavigationPage,
        isPrivate: true,
        title: '地图导航'
    },
    {
        path: '/ai-trip-planner',
        component: AITripPlannerPage,
        isPrivate: true,
        title: 'AI旅行规划'
    },
    {
        path: '*',
        component: NotFoundPage,
        isPrivate: false,
        title: '页面未找到'
    }
];