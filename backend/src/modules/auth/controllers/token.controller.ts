import { Request, Response } from 'express';
import { TokenService } from '../services/token.service';

export class TokenController {
    private tokenService: TokenService;

    constructor() {
        this.tokenService = new TokenService();
    }

    /**
     * 刷新Token
     */
    public refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: '刷新Token不能为空'
                });
                return;
            }

            // 验证刷新Token
            const isValid = await this.tokenService.verifyRefreshToken(refreshToken);
            if (!isValid) {
                res.status(401).json({
                    success: false,
                    message: '刷新Token无效或已过期'
                });
                return;
            }

            // 从刷新Token中提取用户信息
            const userInfo = this.tokenService.extractUserInfoFromToken(refreshToken);
            if (!userInfo) {
                res.status(401).json({
                    success: false,
                    message: '无法从Token中提取用户信息'
                });
                return;
            }

            // 生成新的Access Token
            const newAccessToken = this.tokenService.generateJWT({
                userId: userInfo.userId,
                username: userInfo.username,
                email: userInfo.email
            });

            res.status(200).json({
                success: true,
                message: 'Token刷新成功',
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            console.error('Token刷新错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 获取Token信息
     */
    public getTokenInfo = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                res.status(400).json({
                    success: false,
                    message: 'Token不能为空'
                });
                return;
            }

            const tokenInfo = this.tokenService.extractUserInfoFromToken(token);
            if (!tokenInfo) {
                res.status(401).json({
                    success: false,
                    message: 'Token无效'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Token信息获取成功',
                data: {
                    tokenInfo
                }
            });
        } catch (error) {
            console.error('获取Token信息错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    /**
     * 撤销Token
     */
    public revokeToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.body;

            if (!token) {
                res.status(400).json({
                    success: false,
                    message: 'Token不能为空'
                });
                return;
            }

            await this.tokenService.revokeToken(token);

            res.status(200).json({
                success: true,
                message: 'Token撤销成功'
            });
        } catch (error) {
            console.error('Token撤销错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }
}