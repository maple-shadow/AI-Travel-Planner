import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

export class AuthMiddleware {
    private tokenService: TokenService;
    private authService: AuthService;

    constructor() {
        this.tokenService = new TokenService();
        this.authService = new AuthService();
    }

    /**
     * Token认证中间件
     */
    public authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: '访问令牌不存在'
                });
                return;
            }

            const isValid = await this.tokenService.verifyJWT(token);
            if (!isValid) {
                res.status(401).json({
                    success: false,
                    message: '访问令牌无效或已过期'
                });
                return;
            }

            // 提取用户信息并添加到请求对象
            const userInfo = this.tokenService.extractUserInfoFromToken(token);
            if (userInfo) {
                (req as any).user = userInfo;
            }

            next();
        } catch (error) {
            console.error('Token认证错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 用户授权中间件
     */
    public authorizeUser = (requiredRole?: string) => {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const user = (req as any).user;
                if (!user) {
                    res.status(401).json({
                        success: false,
                        message: '用户未认证'
                    });
                    return;
                }

                // 这里可以添加基于角色的授权逻辑
                // 目前所有认证用户都有基本权限
                if (requiredRole) {
                    // 检查用户角色
                    // const userRole = await this.getUserRole(user.userId);
                    // if (userRole !== requiredRole) {
                    //   res.status(403).json({
                    //     success: false,
                    //     message: '权限不足'
                    //   });
                    //   return;
                    // }
                }

                next();
            } catch (error) {
                console.error('用户授权错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        };
    }

    /**
     * 认证输入验证
     */
    public validateAuthInput = (input: {
        username?: string;
        password?: string;
        email?: string;
    }): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];

        if (input.username && !this.authService.validateUsername(input.username)) {
            errors.push('用户名格式无效（3-20位字母、数字或下划线）');
        }

        if (input.email && !this.authService.validateEmail(input.email)) {
            errors.push('邮箱格式无效');
        }

        if (input.password) {
            const passwordValidation = this.authService.validatePasswordStrength(input.password);
            if (!passwordValidation.isValid) {
                errors.push(...passwordValidation.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证请求体中间件
     */
    public validateRequestBody = (requiredFields: string[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const missingFields: string[] = [];

            for (const field of requiredFields) {
                if (!req.body[field]) {
                    missingFields.push(field);
                }
            }

            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '缺少必要字段',
                    missingFields
                });
                return;
            }

            next();
        };
    }

    /**
     * 限流中间件（基础实现）
     */
    public rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
        const requests = new Map<string, number[]>();

        return (req: Request, res: Response, next: NextFunction): void => {
            const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
            const now = Date.now();
            const windowStart = now - windowMs;

            if (!requests.has(clientIP)) {
                requests.set(clientIP, []);
            }

            const clientRequests = requests.get(clientIP)!;

            // 清理过期的请求记录
            const validRequests = clientRequests.filter(time => time > windowStart);
            requests.set(clientIP, validRequests);

            if (validRequests.length >= maxRequests) {
                res.status(429).json({
                    success: false,
                    message: '请求过于频繁，请稍后再试'
                });
                return;
            }

            validRequests.push(now);
            next();
        };
    }

    /**
     * CORS中间件
     */
    public corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }

        next();
    }
}