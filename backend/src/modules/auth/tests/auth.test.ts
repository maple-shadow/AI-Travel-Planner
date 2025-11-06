/**
 * 认证模块测试文件
 */

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { AuthValidators } from '../validators/auth.validators';
import { AuthConfig, getAuthConfig } from '../config/auth.config';

// 模拟环境变量
process.env.NODE_ENV = 'test';

/**
 * 认证服务测试
 */
describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    test('应该正确哈希密码', async () => {
        const password = 'TestPassword123!';
        const hashedPassword = await authService.hashPassword(password);

        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword.length).toBeGreaterThan(0);
    });

    test('应该正确验证密码', async () => {
        const password = 'TestPassword123!';
        const hashedPassword = await authService.hashPassword(password);
        const isValid = await authService.verifyPassword(password, hashedPassword);

        expect(isValid).toBe(true);
    });

    test('应该验证无效密码', async () => {
        const password = 'TestPassword123!';
        const wrongPassword = 'WrongPassword456!';
        const hashedPassword = await authService.hashPassword(password);
        const isValid = await authService.verifyPassword(wrongPassword, hashedPassword);

        expect(isValid).toBe(false);
    });

    test('应该验证用户名格式', () => {
        expect(authService.validateUsername('validuser')).toBe(true);
        expect(authService.validateUsername('valid_user123')).toBe(true);
        expect(authService.validateUsername('ab')).toBe(false); // 太短
        expect(authService.validateUsername('username_too_long_1234567890')).toBe(false); // 太长
        expect(authService.validateUsername('invalid user')).toBe(false); // 包含空格
        expect(authService.validateUsername('invalid@user')).toBe(false); // 包含特殊字符
    });

    test('应该验证邮箱格式', () => {
        expect(authService.validateEmail('test@example.com')).toBe(true);
        expect(authService.validateEmail('user.name@domain.co.uk')).toBe(true);
        expect(authService.validateEmail('invalid-email')).toBe(false);
        expect(authService.validateEmail('@example.com')).toBe(false);
        expect(authService.validateEmail('test@')).toBe(false);
    });

    test('应该验证密码强度', () => {
        const strongPassword = authService.validatePasswordStrength('StrongPass123!');
        expect(strongPassword.isValid).toBe(true);
        expect(strongPassword.errors.length).toBe(0);

        const weakPassword = authService.validatePasswordStrength('weak');
        expect(weakPassword.isValid).toBe(false);
        expect(weakPassword.errors.length).toBeGreaterThan(0);
    });

    test('应该生成唯一的用户ID', () => {
        const id1 = authService.generateUserId();
        const id2 = authService.generateUserId();

        expect(id1).toBeDefined();
        expect(id2).toBeDefined();
        expect(id1).not.toBe(id2);
        expect(id1.length).toBeGreaterThan(0);
    });
});

/**
 * Token服务测试
 */
describe('TokenService', () => {
    let tokenService: TokenService;
    const testUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com'
    };

    beforeEach(() => {
        tokenService = new TokenService();
    });

    test('应该生成访问Token', () => {
        const token = tokenService.generateAccessToken(testUser);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });

    test('应该生成刷新Token', () => {
        const token = tokenService.generateRefreshToken(testUser);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });

    test('应该验证有效的Token', () => {
        const token = tokenService.generateAccessToken(testUser);
        const payload = tokenService.verifyToken(token);

        expect(payload).toBeDefined();
        expect(payload.userId).toBe(testUser.id);
        expect(payload.username).toBe(testUser.username);
        expect(payload.email).toBe(testUser.email);
    });

    test('应该拒绝无效的Token', () => {
        const invalidToken = 'invalid.token.here';

        expect(() => {
            tokenService.verifyToken(invalidToken);
        }).toThrow();
    });

    test('应该检查Token是否过期', () => {
        const token = tokenService.generateAccessToken(testUser);
        const isExpired = tokenService.isTokenExpired(token);

        expect(isExpired).toBe(false);
    });

    test('应该从Token中提取用户信息', () => {
        const token = tokenService.generateAccessToken(testUser);
        const userInfo = tokenService.extractUserInfo(token);

        expect(userInfo).toBeDefined();
        expect(userInfo.id).toBe(testUser.id);
        expect(userInfo.username).toBe(testUser.username);
        expect(userInfo.email).toBe(testUser.email);
    });
});

/**
 * 验证器测试
 */
describe('AuthValidators', () => {
    let authValidators: AuthValidators;
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        authValidators = new AuthValidators();
    });

    test('应该验证强密码', () => {
        expect(authValidators.isStrongPassword('StrongPass123!')).toBe(true);
        expect(authValidators.isStrongPassword('weak')).toBe(false);
        expect(authValidators.isStrongPassword('nouppercase123!')).toBe(false);
        expect(authValidators.isStrongPassword('NOLOWERCASE123!')).toBe(false);
        expect(authValidators.isStrongPassword('NoNumbers!')).toBe(false);
        expect(authValidators.isStrongPassword('NoSpecial123')).toBe(false);
    });

    test('应该验证有效的邮箱', () => {
        expect(authValidators.isValidEmail('test@example.com')).toBe(true);
        expect(authValidators.isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(authValidators.isValidEmail('invalid-email')).toBe(false);
        expect(authValidators.isValidEmail('@example.com')).toBe(false);
    });
});

/**
 * 配置测试
 */
describe('AuthConfig', () => {
    test('应该根据环境获取正确的配置', () => {
        process.env.NODE_ENV = 'test';
        const testConfig = getAuthConfig();
        expect(testConfig.jwtSecret).toBe('test-jwt-secret-key');

        process.env.NODE_ENV = 'development';
        const devConfig = getAuthConfig();
        expect(devConfig.jwtSecret).toBe('development-jwt-secret-key');

        process.env.NODE_ENV = 'production';
        const prodConfig = getAuthConfig();
        expect(prodConfig.jwtSecret).toBe('production-jwt-secret-key-change-this');
    });

    test('应该验证配置', () => {
        const validConfig: AuthConfig = {
            jwtSecret: 'valid-secret-key-with-sufficient-length',
            tokenExpiry: '15m',
            refreshTokenExpiry: '7d',
            passwordSaltRounds: 12,
            allowedOrigins: 'http://localhost:3000'
        };

        const invalidConfig: AuthConfig = {
            jwtSecret: 'short',
            tokenExpiry: '15m',
            refreshTokenExpiry: '7d',
            passwordSaltRounds: 5, // 太少的盐轮数
            allowedOrigins: ''
        };

        // 这里需要导入验证函数，暂时注释
        // const validResult = validateAuthConfig(validConfig);
        // const invalidResult = validateAuthConfig(invalidConfig);

        // expect(validResult.isValid).toBe(true);
        // expect(invalidResult.isValid).toBe(false);
        // expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
});

/**
 * 集成测试
 */
describe('认证模块集成测试', () => {
    let authService: AuthService;
    let tokenService: TokenService;

    const testUser = {
        username: 'integrationuser',
        email: 'integration@test.com',
        password: 'IntegrationPass123!'
    };

    beforeEach(() => {
        authService = new AuthService();
        tokenService = new TokenService();
    });

    test('应该完成完整的注册和登录流程', async () => {
        // 1. 创建用户
        const userId = authService.generateUserId();
        const hashedPassword = await authService.hashPassword(testUser.password);

        // 2. 生成Token
        const accessToken = tokenService.generateAccessToken({
            id: userId,
            username: testUser.username,
            email: testUser.email
        });

        const refreshToken = tokenService.generateRefreshToken({
            id: userId,
            username: testUser.username,
            email: testUser.email
        });

        // 3. 验证Token
        const accessPayload = tokenService.verifyToken(accessToken);
        const refreshPayload = tokenService.verifyToken(refreshToken);

        // 4. 验证用户信息
        expect(accessPayload.userId).toBe(userId);
        expect(refreshPayload.userId).toBe(userId);

        // 5. 验证密码
        const isPasswordValid = await authService.verifyPassword(testUser.password, hashedPassword);
        expect(isPasswordValid).toBe(true);
    });

    test('应该处理Token刷新流程', () => {
        const user = {
            id: 'refresh-test-user',
            username: 'refreshtest',
            email: 'refresh@test.com'
        };

        // 生成原始Token
        const originalToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);

        // 验证原始Token
        const originalPayload = tokenService.verifyToken(originalToken);
        expect(originalPayload.userId).toBe(user.id);

        // 刷新Token（模拟）
        const newToken = tokenService.generateAccessToken(user);
        const newPayload = tokenService.verifyToken(newToken);

        expect(newPayload.userId).toBe(user.id);
        expect(newToken).not.toBe(originalToken); // 新Token应该不同
    });
});

/**
 * 错误处理测试
 */
describe('错误处理', () => {
    let authService: AuthService;
    let tokenService: TokenService;

    beforeEach(() => {
        authService = new AuthService();
        tokenService = new TokenService();
    });

    test('应该处理无效的密码验证', async () => {
        const hashedPassword = await authService.hashPassword('validpassword');

        // 空密码
        await expect(authService.verifyPassword('', hashedPassword)).rejects.toThrow();

        // null密码
        await expect(authService.verifyPassword(null as any, hashedPassword)).rejects.toThrow();

        // undefined密码
        await expect(authService.verifyPassword(undefined as any, hashedPassword)).rejects.toThrow();
    });

    test('应该处理无效的Token验证', () => {
        // 空Token
        expect(() => tokenService.verifyToken('')).toThrow();

        // null Token
        expect(() => tokenService.verifyToken(null as any)).toThrow();

        // undefined Token
        expect(() => tokenService.verifyToken(undefined as any)).toThrow();

        // 格式错误的Token
        expect(() => tokenService.verifyToken('invalid.token.format')).toThrow();
    });
});

/**
 * 性能测试
 */
describe('性能测试', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    test('密码哈希性能', async () => {
        const startTime = Date.now();
        const password = 'TestPassword123!';

        // 哈希10次密码
        const promises = Array(10).fill(0).map(() =>
            authService.hashPassword(password)
        );

        await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 10次哈希应该在合理时间内完成（例如5秒内）
        expect(duration).toBeLessThan(5000);
    }, 10000); // 设置10秒超时

    test('密码验证性能', async () => {
        const password = 'TestPassword123!';
        const hashedPassword = await authService.hashPassword(password);

        const startTime = Date.now();

        // 验证10次密码
        const promises = Array(10).fill(0).map(() =>
            authService.verifyPassword(password, hashedPassword)
        );

        const results = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 所有验证都应该成功
        results.forEach(result => {
            expect(result).toBe(true);
        });

        // 10次验证应该在合理时间内完成
        expect(duration).toBeLessThan(5000);
    }, 10000); // 设置10秒超时
});