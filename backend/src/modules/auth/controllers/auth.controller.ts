import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { AuthValidators } from '../validators/auth.validators';

export class AuthController {
    private authService: AuthService;
    private tokenService: TokenService;

    private authValidators: AuthValidators;

    constructor() {
        this.authService = new AuthService();
        this.tokenService = new TokenService();
        this.authValidators = new AuthValidators();
    }

    /**
     * 用户注册
     */
    public registerUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password, email } = req.body;

            // 验证输入 - 这里应该通过中间件处理，所以直接进行业务逻辑

            // 检查用户是否已存在
            const existingUser = await this.authService.findUserByEmail(email);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: '用户已存在'
                });
                return;
            }

            // 创建用户
            const user = await this.authService.createUser({
                username,
                password,
                email
            });

            // 生成Token
            const token = this.tokenService.generateJWT({
                userId: user.id,
                username: user.username,
                email: user.email
            });

            res.status(201).json({
                success: true,
                message: '用户注册成功',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    },
                    token
                }
            });
        } catch (error) {
            console.error('注册用户错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 用户登录
     */
    public loginUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            // 验证输入
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: '邮箱和密码不能为空'
                });
                return;
            }

            // 验证用户凭据
            const user = await this.authService.validateUserCredentials(email, password);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误'
                });
                return;
            }

            // 生成Token
            const token = this.tokenService.generateJWT({
                userId: user.id,
                username: user.username,
                email: user.email
            });

            res.status(200).json({
                success: true,
                message: '登录成功',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    },
                    token
                }
            });
        } catch (error) {
            console.error('用户登录错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 用户登出
     */
    public logoutUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (token) {
                // 将Token加入黑名单
                await this.tokenService.revokeToken(token);
            }

            res.status(200).json({
                success: true,
                message: '登出成功'
            });
        } catch (error) {
            console.error('用户登出错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 验证Token
     */
    public verifyToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'Token不存在'
                });
                return;
            }

            const isValid = await this.tokenService.verifyJWT(token);

            if (!isValid) {
                res.status(401).json({
                    success: false,
                    message: 'Token无效或已过期'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Token验证成功'
            });
        } catch (error) {
            console.error('Token验证错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 获取当前用户资料
     */
    public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // 从认证中间件中获取用户信息
            const user = req.user;

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: '用户未登录'
                });
                return;
            }

            // 从数据库获取完整的用户信息
            const userData = await this.authService.findUserById(user.id);

            if (!userData) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: '获取用户资料成功',
                data: {
                    user: {
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt
                    }
                }
            });
        } catch (error) {
            console.error('获取用户资料错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }
}