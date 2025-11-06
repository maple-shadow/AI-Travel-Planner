/**
 * 认证模块入口文件
 */

// 导出控制器
export { AuthController } from './controllers/auth.controller';
export { TokenController } from './controllers/token.controller';

// 导出服务
export { AuthService } from './services/auth.service';
export { TokenService } from './services/token.service';

// 导出中间件
export { AuthMiddleware } from './middleware/auth.middleware';

// 导出验证器
export { AuthValidators } from './validators/auth.validators';

// 导出路由
export { AuthRoutes, authRoutes } from './routes/auth.routes';

// 导入路由实例
import { authRoutes } from './routes/auth.routes';

// 导出类型
export * from './types/auth.types';

// 导出配置
export * from './config/auth.config';

// 导出认证模块配置
export const authModuleConfig = {
    name: 'auth',
    version: '1.0.0',
    description: '用户认证和授权模块',
    routes: {
        prefix: '/api/auth'
    }
};

/**
 * 认证模块初始化函数
 */
export const initializeAuthModule = () => {
    console.log('🔐 认证模块初始化完成');

    return {
        routes: authRoutes.getRouter(),
        middleware: authRoutes.getAuthMiddleware(),
        config: authModuleConfig
    };
};

/**
 * 默认导出认证模块
 */
export default {
    initialize: initializeAuthModule,
    config: authModuleConfig,
    routes: authRoutes.getRouter(),
    middleware: authRoutes.getAuthMiddleware()
};