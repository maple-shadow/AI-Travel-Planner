import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { TokenController } from '../controllers/token.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AuthValidators } from '../validators/auth.validators';

export class AuthRoutes {
    public router: Router;
    private authController: AuthController;
    private tokenController: TokenController;
    private authMiddleware: AuthMiddleware;
    private authValidators: AuthValidators;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        this.tokenController = new TokenController();
        this.authMiddleware = new AuthMiddleware();
        this.authValidators = new AuthValidators();

        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // 用户注册
        this.router.post(
            '/register',
            this.authValidators.validateRegistration(),
            this.authController.registerUser
        );

        // 用户登录
        this.router.post(
            '/login',
            this.authValidators.validateLogin(),
            this.authController.loginUser
        );

        // 用户登出
        this.router.post(
            '/logout',
            this.authMiddleware.authenticateToken,
            this.authController.logoutUser
        );

        // Token验证
        this.router.get(
            '/verify',
            this.authValidators.validateToken(),
            this.authController.verifyToken
        );

        // Token验证（兼容前端validate端点）
        this.router.get(
            '/validate',
            this.authValidators.validateToken(),
            this.authController.verifyToken
        );

        // 刷新Token
        this.router.post(
            '/refresh',
            this.authValidators.validateRefreshToken(),
            this.tokenController.refreshToken
        );

        // 获取Token信息
        this.router.get(
            '/token-info',
            this.authMiddleware.authenticateToken,
            this.tokenController.getTokenInfo
        );

        // 撤销Token
        this.router.post(
            '/revoke',
            this.authMiddleware.authenticateToken,
            this.tokenController.revokeToken
        );

        // 健康检查
        this.router.get('/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: '认证服务运行正常',
                timestamp: new Date().toISOString()
            });
        });

        // 获取认证配置信息（仅用于开发调试）
        this.router.get(
            '/config',
            this.authMiddleware.authenticateToken,
            (req, res) => {
                res.status(200).json({
                    success: true,
                    data: {
                        tokenExpiry: process.env.TOKEN_EXPIRY || '1h',
                        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
                        allowedOrigins: process.env.ALLOWED_ORIGINS || '*'
                    }
                });
            }
        );
    }

    /**
     * 获取路由实例
     */
    public getRouter(): Router {
        return this.router;
    }

    /**
     * 获取认证中间件
     */
    public getAuthMiddleware(): AuthMiddleware {
        return this.authMiddleware;
    }
}

// 导出路由实例
export const authRoutes = new AuthRoutes();