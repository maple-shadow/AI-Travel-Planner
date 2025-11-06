/**
 * 认证模块配置文件
 */

import { AuthConfig } from '../types/auth.types';

/**
 * 认证模块默认配置
 */
export const authConfig: AuthConfig = {
    // JWT密钥（生产环境应该从环境变量获取）
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',

    // Token过期时间
    tokenExpiry: process.env.TOKEN_EXPIRY || '15m', // 15分钟

    // 刷新Token过期时间
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d', // 7天

    // 密码盐轮数
    passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS || '12'),

    // 允许的源
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
};

/**
 * 认证模块开发环境配置
 */
export const authConfigDevelopment: AuthConfig = {
    ...authConfig,
    jwtSecret: 'development-jwt-secret-key',
    tokenExpiry: '1h', // 开发环境延长到1小时
    refreshTokenExpiry: '30d', // 开发环境延长到30天
    passwordSaltRounds: 10, // 开发环境减少盐轮数以提高性能
    allowedOrigins: 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173'
};

/**
 * 认证模块生产环境配置
 */
export const authConfigProduction: AuthConfig = {
    ...authConfig,
    jwtSecret: process.env.JWT_SECRET || 'production-jwt-secret-key-change-this',
    tokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    passwordSaltRounds: 12,
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'https://yourdomain.com'
};

/**
 * 认证模块测试环境配置
 */
export const authConfigTest: AuthConfig = {
    ...authConfig,
    jwtSecret: 'test-jwt-secret-key',
    tokenExpiry: '5m',
    refreshTokenExpiry: '1d',
    passwordSaltRounds: 8, // 测试环境使用更少的盐轮数
    allowedOrigins: 'http://localhost:3000'
};

/**
 * 根据环境获取认证配置
 */
export const getAuthConfig = (): AuthConfig => {
    const nodeEnv = process.env.NODE_ENV || 'development';

    switch (nodeEnv) {
        case 'production':
            return authConfigProduction;
        case 'test':
            return authConfigTest;
        case 'development':
        default:
            return authConfigDevelopment;
    }
};

/**
 * 验证认证配置
 */
export const validateAuthConfig = (config: AuthConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.jwtSecret || config.jwtSecret.length < 32) {
        errors.push('JWT密钥长度至少需要32个字符');
    }

    if (config.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
        errors.push('请在生产环境中修改默认的JWT密钥');
    }

    if (config.passwordSaltRounds < 8 || config.passwordSaltRounds > 15) {
        errors.push('密码盐轮数应该在8-15之间');
    }

    if (!config.allowedOrigins) {
        errors.push('必须配置允许的源');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * 认证模块配置常量
 */
export const AUTH_CONSTANTS = {
    // Token类型
    TOKEN_TYPES: {
        ACCESS: 'access',
        REFRESH: 'refresh'
    },

    // 认证头
    AUTH_HEADER: 'Authorization',
    BEARER_PREFIX: 'Bearer ',

    // 密码要求
    PASSWORD_REQUIREMENTS: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SYMBOLS: true
    },

    // 用户名要求
    USERNAME_REQUIREMENTS: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        ALLOWED_CHARS: /^[a-zA-Z0-9_]+$/
    },

    // 邮箱验证正则
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // 默认分页设置
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // 速率限制
    RATE_LIMIT: {
        LOGIN: {
            windowMs: 15 * 60 * 1000, // 15分钟
            max: 5 // 5次尝试
        },
        REGISTER: {
            windowMs: 60 * 60 * 1000, // 1小时
            max: 3 // 3次注册
        },
        GENERAL: {
            windowMs: 15 * 60 * 1000, // 15分钟
            max: 100 // 100次请求
        }
    }
};

/**
 * 导出默认配置
 */
export default getAuthConfig();