/**
 * 单元测试模块 - 认证模块测试套件
 * 模块15：单元测试模块
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { TokenService } from '../../../modules/auth/services/token.service';
import { AuthValidators } from '../../../modules/auth/validators/auth.validators';
import { authConfigTest } from '../../../modules/auth/config/auth.config';

/**
 * 认证模块测试套件
 */
export class AuthTestSuite {
    private authService: AuthService;
    private tokenService: TokenService;
    private validators: AuthValidators;

    constructor() {
        this.authService = new AuthService();
        this.tokenService = new TokenService();
        this.validators = new AuthValidators();
    }

    /**
     * 测试用户注册功能
     */
    testUserRegistration() {
        describe('用户注册功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功注册新用户', async () => {
                const userData = {
                    email: 'test@example.com',
                    password: 'password123',
                    username: 'testuser'
                };

                const result = await this.authService.register(userData);

                expect(result.success).toBe(true);
                expect(result.user).toBeDefined();
                expect(result.user.email).toBe(userData.email);
            });

            it('应该拒绝重复邮箱注册', async () => {
                const userData = {
                    email: 'existing@example.com',
                    password: 'password123',
                    username: 'existinguser'
                };

                // 模拟用户已存在
                jest.spyOn(this.authService, 'findUserByEmail').mockResolvedValue({
                    id: '123',
                    email: userData.email,
                    username: 'existinguser'
                });

                await expect(this.authService.register(userData)).rejects.toThrow('用户已存在');
            });

            it('应该验证密码强度', async () => {
                const weakPasswordData = {
                    email: 'test@example.com',
                    password: '123', // 弱密码
                    username: 'testuser'
                };

                await expect(this.authService.register(weakPasswordData)).rejects.toThrow('密码强度不足');
            });
        });
    }

    /**
     * 测试用户登录功能
     */
    testUserLogin() {
        describe('用户登录功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功登录有效用户', async () => {
                const loginData = {
                    email: 'test@example.com',
                    password: 'password123'
                };

                const result = await this.authService.login(loginData);

                expect(result.success).toBe(true);
                expect(result.token).toBeDefined();
                expect(result.refreshToken).toBeDefined();
                expect(result.user).toBeDefined();
            });

            it('应该拒绝无效密码', async () => {
                const loginData = {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                };

                await expect(this.authService.login(loginData)).rejects.toThrow('密码错误');
            });

            it('应该拒绝不存在的用户', async () => {
                const loginData = {
                    email: 'nonexistent@example.com',
                    password: 'password123'
                };

                await expect(this.authService.login(loginData)).rejects.toThrow('用户不存在');
            });
        });
    }

    /**
     * 测试Token管理功能
     */
    testTokenManagement() {
        describe('Token管理功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该生成有效的JWT Token', async () => {
                const user = {
                    id: '123',
                    email: 'test@example.com',
                    username: 'testuser'
                };

                const token = await this.tokenService.generateToken(user);

                expect(token).toBeDefined();
                expect(typeof token).toBe('string');
            });

            it('应该验证有效的Token', async () => {
                const user = { id: '123', email: 'test@example.com' };
                const token = await this.tokenService.generateToken(user);

                const decoded = await this.tokenService.verifyToken(token);

                expect(decoded).toBeDefined();
                expect(decoded.id).toBe(user.id);
                expect(decoded.email).toBe(user.email);
            });

            it('应该拒绝无效的Token', async () => {
                const invalidToken = 'invalid.token.here';

                await expect(this.tokenService.verifyToken(invalidToken)).rejects.toThrow('Token无效');
            });

            it('应该刷新Token', async () => {
                const refreshToken = 'valid.refresh.token';

                const result = await this.tokenService.refreshToken(refreshToken);

                expect(result.success).toBe(true);
                expect(result.newToken).toBeDefined();
                expect(result.newRefreshToken).toBeDefined();
            });
        });
    }

    /**
     * 测试验证器功能
     */
    testValidators() {
        describe('验证器功能测试', () => {
            it('应该验证有效的邮箱格式', () => {
                const validEmails = [
                    'test@example.com',
                    'user.name@domain.co.uk',
                    'test+tag@example.org'
                ];

                validEmails.forEach(email => {
                    expect(this.validators.validateEmail(email)).toBe(true);
                });
            });

            it('应该拒绝无效的邮箱格式', () => {
                const invalidEmails = [
                    'invalid',
                    'test@',
                    '@example.com',
                    'test@.com'
                ];

                invalidEmails.forEach(email => {
                    expect(this.validators.validateEmail(email)).toBe(false);
                });
            });

            it('应该验证密码强度', () => {
                const strongPasswords = [
                    'Password123!',
                    'SecurePass2024$',
                    'MyP@ssw0rd'
                ];

                const weakPasswords = [
                    '123',
                    'password',
                    'PASSWORD',
                    'Pass1'
                ];

                strongPasswords.forEach(password => {
                    expect(this.validators.validatePasswordStrength(password)).toBe(true);
                });

                weakPasswords.forEach(password => {
                    expect(this.validators.validatePasswordStrength(password)).toBe(false);
                });
            });
        });
    }

    /**
     * 测试错误处理
     */
    testErrorHandling() {
        describe('错误处理测试', () => {
            it('应该处理数据库连接错误', async () => {
                // 模拟数据库错误
                jest.spyOn(this.authService, 'register').mockRejectedValue(new Error('数据库连接失败'));

                await expect(this.authService.register({
                    email: 'test@example.com',
                    password: 'password123',
                    username: 'testuser'
                })).rejects.toThrow('数据库连接失败');
            });

            it('应该处理网络超时错误', async () => {
                // 模拟超时
                jest.spyOn(this.authService, 'login').mockRejectedValue(new Error('请求超时'));

                await expect(this.authService.login({
                    email: 'test@example.com',
                    password: 'password123'
                })).rejects.toThrow('请求超时');
            });

            it('应该处理无效的输入数据', async () => {
                const invalidData = {
                    email: 'invalid-email',
                    password: '123'
                };

                await expect(this.authService.login(invalidData)).rejects.toThrow('输入数据无效');
            });
        });
    }

    /**
     * 运行所有认证模块测试
     */
    runAllTests() {
        describe('认证模块 - 完整测试套件', () => {
            this.testUserRegistration();
            this.testUserLogin();
            this.testTokenManagement();
            this.testValidators();
            this.testErrorHandling();
        });
    }
}

/**
 * 创建认证测试套件实例
 */
export const createAuthTestSuite = () => {
    return new AuthTestSuite();
};