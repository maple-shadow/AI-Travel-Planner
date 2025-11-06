import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { TokenPayload, TokenBlacklist } from '../types/auth.types';

export class TokenService {
    private jwtSecret: string;
    private tokenExpiry: string;
    private refreshTokenExpiry: string;
    private tokenBlacklist: Set<string> = new Set();

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        this.tokenExpiry = process.env.TOKEN_EXPIRY || '1h';
        this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    }

    /**
     * 生成JWT Token
     */
    public generateJWT(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.tokenExpiry as StringValue
        };
        return jwt.sign(payload, this.jwtSecret, options);
    }

    /**
     * 生成刷新Token
     */
    public generateRefreshToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.refreshTokenExpiry as StringValue
        };
        return jwt.sign(payload, this.jwtSecret, options);
    }

    /**
     * 验证JWT Token
     */
    public async verifyJWT(token: string): Promise<boolean> {
        try {
            // 检查Token是否在黑名单中
            if (this.tokenBlacklist.has(token)) {
                return false;
            }

            jwt.verify(token, this.jwtSecret);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 验证刷新Token
     */
    public async verifyRefreshToken(token: string): Promise<boolean> {
        return this.verifyJWT(token);
    }

    /**
     * 撤销Token（加入黑名单）
     */
    public async revokeToken(token: string): Promise<void> {
        this.tokenBlacklist.add(token);
    }

    /**
     * 从Token中提取用户信息
     */
    public extractUserInfoFromToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * 解码Token（不验证）
     */
    public decodeToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.decode(token) as TokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * 检查Token是否即将过期
     */
    public isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
        try {
            const decoded = jwt.decode(token) as any;
            if (!decoded || !decoded.exp) {
                return false;
            }

            const expirationTime = decoded.exp * 1000; // 转换为毫秒
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            return timeUntilExpiry <= thresholdMinutes * 60 * 1000;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取Token剩余有效期（分钟）
     */
    public getTokenRemainingTime(token: string): number {
        try {
            const decoded = jwt.decode(token) as any;
            if (!decoded || !decoded.exp) {
                return 0;
            }

            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            return Math.max(0, Math.floor(timeUntilExpiry / (60 * 1000)));
        } catch (error) {
            return 0;
        }
    }

    /**
     * 清理过期的黑名单Token
     */
    public cleanupExpiredBlacklistTokens(): void {
        // 这里可以定期清理过期的黑名单Token
        // 目前使用Set存储，实际生产环境可能需要更复杂的清理机制
    }

    /**
     * 获取黑名单大小（用于监控）
     */
    public getBlacklistSize(): number {
        return this.tokenBlacklist.size;
    }

    /**
     * 设置JWT密钥（用于测试）
     */
    public setJwtSecret(secret: string): void {
        this.jwtSecret = secret;
    }

    /**
     * 设置Token过期时间（用于测试）
     */
    public setTokenExpiry(expiry: string): void {
        this.tokenExpiry = expiry;
    }
}