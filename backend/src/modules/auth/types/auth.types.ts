/**
 * 认证模块类型定义
 */

/**
 * Token载荷接口
 */
export interface TokenPayload {
    userId: string;
    username: string;
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * 用户凭据接口
 */
export interface UserCredentials {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive?: boolean;
}

/**
 * Token黑名单接口
 */
export interface TokenBlacklist {
    token: string;
    revokedAt: Date;
    expiresAt: Date;
}

/**
 * 认证响应接口
 */
export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user?: {
            id: string;
            username: string;
            email: string;
        };
        token?: string;
        accessToken?: string;
        refreshToken?: string;
    };
    errors?: string[];
}

/**
 * 注册请求接口
 */
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
}

/**
 * 登录请求接口
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Token刷新请求接口
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * 密码重置请求接口
 */
export interface PasswordResetRequest {
    currentPassword: string;
    newPassword: string;
}

/**
 * 用户信息更新请求接口
 */
export interface UserUpdateRequest {
    username?: string;
    email?: string;
}

/**
 * 认证配置接口
 */
export interface AuthConfig {
    jwtSecret: string;
    tokenExpiry: string;
    refreshTokenExpiry: string;
    passwordSaltRounds: number;
    allowedOrigins: string;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
    page: number;
    limit: number;
    total: number;
}

/**
 * 用户会话接口
 */
export interface UserSession {
    sessionId: string;
    userId: string;
    token: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
}

/**
 * 认证错误类型
 */
export enum AuthErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    TOKEN_INVALID = 'TOKEN_INVALID',
    TOKEN_REVOKED = 'TOKEN_REVOKED',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * 认证错误接口
 */
export interface AuthError {
    type: AuthErrorType;
    message: string;
    details?: any;
}

/**
 * 密码强度检查结果
 */
export interface PasswordStrengthResult {
    score: number; // 0-4
    feedback: {
        suggestions: string[];
        warning?: string;
    };
}

/**
 * 认证统计信息
 */
export interface AuthStatistics {
    totalUsers: number;
    activeSessions: number;
    dailyLogins: number;
    failedAttempts: number;
    blacklistedTokens: number;
}

/**
 * 安全事件类型
 */
export enum SecurityEventType {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    LOGOUT = 'LOGOUT',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE',
    TOKEN_REVOKED = 'TOKEN_REVOKED',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

/**
 * 安全事件接口
 */
export interface SecurityEvent {
    id: string;
    userId?: string;
    type: SecurityEventType;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    details?: any;
}

/**
 * 认证中间件配置
 */
export interface MiddlewareConfig {
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
    };
    cors?: {
        allowedOrigins: string[];
        allowedMethods: string[];
        allowedHeaders: string[];
    };
    security?: {
        enableHSTS: boolean;
        enableCSP: boolean;
        enableXSS: boolean;
    };
}