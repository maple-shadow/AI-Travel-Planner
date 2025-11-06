import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AuthService } from '../services/auth.service';

export class AuthValidators {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
   * 注册验证器
   */
    public validateRegistration = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { username, password, email } = req.body;
            const errors: string[] = [];

            // 检查必填字段
            if (!username) {
                errors.push('用户名不能为空');
            }

            if (!password) {
                errors.push('密码不能为空');
            }

            if (!email) {
                errors.push('邮箱不能为空');
            }

            // 验证字段格式
            if (username && !this.authService.validateUsername(username)) {
                errors.push('用户名格式无效（3-20位字母、数字或下划线）');
            }

            if (email && !this.authService.validateEmail(email)) {
                errors.push('邮箱格式无效');
            }

            if (password) {
                const passwordValidation = this.authService.validatePasswordStrength(password);
                if (!passwordValidation.isValid) {
                    errors.push(...passwordValidation.errors);
                }
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '输入验证失败',
                    errors
                });
                return;
            }

            next();
        };
    }

    /**
   * 登录验证器
   */
    public validateLogin = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { email, password } = req.body;
            const errors: string[] = [];

            if (!email) {
                errors.push('邮箱不能为空');
            }

            if (!password) {
                errors.push('密码不能为空');
            }

            if (email && !this.authService.validateEmail(email)) {
                errors.push('邮箱格式无效');
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '输入验证失败',
                    errors
                });
                return;
            }

            next();
        };
    }

    /**
   * Token验证器
   */
    public validateToken = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'Token不能为空'
                });
                return;
            }

            next();
        };
    }

    /**
   * 刷新Token验证器
   */
    public validateRefreshToken = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: '刷新Token不能为空'
                });
                return;
            }

            next();
        };
    }

    /**
   * 用户信息更新验证器
   */
    public validateUserUpdate = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { username, email } = req.body;
            const errors: string[] = [];

            // 验证用户名格式
            if (username && !this.authService.validateUsername(username)) {
                errors.push('用户名格式无效（3-20位字母、数字或下划线）');
            }

            // 验证邮箱格式
            if (email && !this.authService.validateEmail(email)) {
                errors.push('邮箱格式无效');
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '输入验证失败',
                    errors
                });
                return;
            }

            next();
        };
    }

    /**
   * 密码重置验证器
   */
    public validatePasswordReset = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { currentPassword, newPassword } = req.body;
            const errors: string[] = [];

            if (!currentPassword) {
                errors.push('当前密码不能为空');
            }

            if (!newPassword) {
                errors.push('新密码不能为空');
            }

            if (newPassword) {
                const passwordValidation = this.authService.validatePasswordStrength(newPassword);
                if (!passwordValidation.isValid) {
                    errors.push(...passwordValidation.errors);
                }
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '输入验证失败',
                    errors
                });
                return;
            }

            next();
        };
    }

    /**
  /**
   * 邮箱验证器
   */
    public validateEmail = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    success: false,
                    message: '邮箱不能为空'
                });
                return;
            }

            if (!this.authService.validateEmail(email)) {
                res.status(400).json({
                    success: false,
                    message: '邮箱格式无效'
                });
                return;
            }

            next();
        };
    }

    /**
   * 分页参数验证器
   */
    public validatePagination = (): ((req: Request, res: Response, next: NextFunction) => void) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { page, limit } = req.query;
            const errors: string[] = [];

            // 验证页码
            if (page && (isNaN(Number(page)) || Number(page) < 1)) {
                errors.push('页码必须是大于0的整数');
            }

            // 验证每页数量
            if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
                errors.push('每页数量必须是1-100之间的整数');
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '分页参数验证失败',
                    errors
                });
                return;
            }

            next();
        };
    }

    /**
     * 文件上传验证器
     */
    public validateFileUpload = (allowedTypes: string[], maxSize: number): ((req: Request & { file?: Express.Multer.File }, res: Response, next: NextFunction) => void) => {
        return (req: Request & { file?: Express.Multer.File }, res: Response, next: NextFunction): void => {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: '请选择要上传的文件'
                });
                return;
            }

            const errors: string[] = [];

            // 检查文件类型
            if (!allowedTypes.includes(req.file.mimetype)) {
                errors.push(`不支持的文件类型，支持的类型：${allowedTypes.join(', ')}`);
            }

            // 检查文件大小
            if (req.file.size > maxSize) {
                errors.push(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`);
            }

            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: '文件验证失败',
                    errors
                });
                return;
            }

            next();
        };
    }
}