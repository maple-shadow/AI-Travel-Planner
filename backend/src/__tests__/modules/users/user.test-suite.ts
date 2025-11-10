/**
 * 单元测试模块 - 用户管理模块测试套件
 * 模块15：单元测试模块
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { UserService } from '../../../modules/users/services/user.service';
import { UserController } from '../../../modules/users/controllers/user.controller';
import { UserValidator } from '../../../modules/users/validators/user.validator';

/**
 * 用户管理模块测试套件
 */
export class UserTestSuite {
    private userService: UserService;
    private userController: UserController;
    private userValidator: UserValidator;

    constructor() {
        this.userService = new UserService();
        this.userController = new UserController();
        this.userValidator = new UserValidator();
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
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Password123!',
                    firstName: '张',
                    lastName: '三'
                };

                const result = await this.userService.registerUser(userData);

                expect(result.success).toBe(true);
                expect(result.user.id).toBeDefined();
                expect(result.user.username).toBe('testuser');
                expect(result.user.email).toBe('test@example.com');
                expect(result.user.password).not.toBe('Password123!'); // 密码应该被哈希
            });

            it('应该验证用户注册数据', async () => {
                const invalidUserData = {
                    username: 'ab', // 用户名太短
                    email: 'invalid-email', // 无效邮箱
                    password: 'weak', // 弱密码
                    firstName: '' // 空名字
                };

                const validation = this.userValidator.validateUserRegistration(invalidUserData);

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('用户名长度必须在3-20个字符之间');
                expect(validation.errors).toContain('邮箱格式无效');
                expect(validation.errors).toContain('密码强度不足');
                expect(validation.errors).toContain('名字不能为空');
            });

            it('应该防止重复用户名注册', async () => {
                const userData = {
                    username: 'existinguser',
                    email: 'new@example.com',
                    password: 'Password123!'
                };

                // 第一次注册
                await this.userService.registerUser(userData);

                // 尝试注册相同用户名
                const result = await this.userService.registerUser(userData);

                expect(result.success).toBe(false);
                expect(result.error).toContain('用户名已存在');
            });

            it('应该防止重复邮箱注册', async () => {
                const userData = {
                    username: 'newuser',
                    email: 'existing@example.com',
                    password: 'Password123!'
                };

                // 第一次注册
                await this.userService.registerUser(userData);

                // 尝试注册相同邮箱
                const duplicateData = {
                    username: 'anotheruser',
                    email: 'existing@example.com',
                    password: 'Password123!'
                };

                const result = await this.userService.registerUser(duplicateData);

                expect(result.success).toBe(false);
                expect(result.error).toContain('邮箱已被注册');
            });

            it('应该设置默认用户角色', async () => {
                const userData = {
                    username: 'defaultuser',
                    email: 'default@example.com',
                    password: 'Password123!'
                };

                const result = await this.userService.registerUser(userData);

                expect(result.user.role).toBe('USER');
                expect(result.user.isActive).toBe(true);
                expect(result.user.createdAt).toBeDefined();
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

            it('应该成功登录用户', async () => {
                const credentials = {
                    username: 'testuser',
                    password: 'Password123!'
                };

                const result = await this.userService.loginUser(credentials);

                expect(result.success).toBe(true);
                expect(result.token).toBeDefined();
                expect(result.user.id).toBeDefined();
                expect(result.user.username).toBe('testuser');
            });

            it('应该验证登录凭据', async () => {
                const invalidCredentials = {
                    username: '',
                    password: ''
                };

                const validation = this.userValidator.validateLoginCredentials(invalidCredentials);

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('用户名不能为空');
                expect(validation.errors).toContain('密码不能为空');
            });

            it('应该处理错误的用户名', async () => {
                const credentials = {
                    username: 'nonexistentuser',
                    password: 'Password123!'
                };

                const result = await this.userService.loginUser(credentials);

                expect(result.success).toBe(false);
                expect(result.error).toContain('用户不存在');
            });

            it('应该处理错误的密码', async () => {
                const credentials = {
                    username: 'testuser',
                    password: 'WrongPassword123!'
                };

                const result = await this.userService.loginUser(credentials);

                expect(result.success).toBe(false);
                expect(result.error).toContain('密码错误');
            });

            it('应该处理非活跃用户登录', async () => {
                const credentials = {
                    username: 'inactiveuser',
                    password: 'Password123!'
                };

                const result = await this.userService.loginUser(credentials);

                expect(result.success).toBe(false);
                expect(result.error).toContain('账户已被禁用');
            });

            it('应该记录登录历史', async () => {
                const credentials = {
                    username: 'testuser',
                    password: 'Password123!'
                };

                const result = await this.userService.loginUser(credentials);

                expect(result.success).toBe(true);
                expect(result.loginHistory).toBeDefined();
                expect(result.loginHistory.timestamp).toBeDefined();
                expect(result.loginHistory.ipAddress).toBeDefined();
            });
        });
    }

    /**
     * 测试用户信息查询功能
     */
    testUserQuery() {
        describe('用户信息查询功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该根据ID查询用户信息', async () => {
                const userId = 'user123';

                const result = await this.userService.getUserById(userId);

                expect(result.success).toBe(true);
                expect(result.user.id).toBe(userId);
                expect(result.user.username).toBeDefined();
                expect(result.user.email).toBeDefined();
            });

            it('应该查询用户列表', async () => {
                const filters = {
                    role: 'USER',
                    isActive: true
                };

                const result = await this.userService.getUsers(filters);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.users)).toBe(true);
                result.users.forEach(user => {
                    if (filters.role) {
                        expect(user.role).toBe(filters.role);
                    }
                    if (filters.isActive !== undefined) {
                        expect(user.isActive).toBe(filters.isActive);
                    }
                });
            });

            it('应该支持用户搜索', async () => {
                const searchQuery = 'test';

                const result = await this.userService.searchUsers(searchQuery);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.users)).toBe(true);
                result.users.forEach(user => {
                    expect(
                        user.username.includes(searchQuery) ||
                        user.email.includes(searchQuery) ||
                        user.firstName.includes(searchQuery) ||
                        user.lastName.includes(searchQuery)
                    ).toBe(true);
                });
            });

            it('应该处理不存在的用户查询', async () => {
                const nonExistentUserId = 'non-existent-id';

                const result = await this.userService.getUserById(nonExistentUserId);

                expect(result.success).toBe(false);
                expect(result.error).toContain('用户不存在');
            });

            it('应该保护敏感信息', async () => {
                const userId = 'user123';

                const result = await this.userService.getUserById(userId);

                expect(result.success).toBe(true);
                expect(result.user.password).toBeUndefined();
                expect(result.user.salt).toBeUndefined();
            });
        });
    }

    /**
     * 测试用户信息更新功能
     */
    testUserUpdate() {
        describe('用户信息更新功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功更新用户信息', async () => {
                const userId = 'user123';
                const updateData = {
                    firstName: '李',
                    lastName: '四',
                    phone: '13800138000'
                };

                const result = await this.userService.updateUser(userId, updateData);

                expect(result.success).toBe(true);
                expect(result.user.firstName).toBe('李');
                expect(result.user.lastName).toBe('四');
                expect(result.user.phone).toBe('13800138000');
                expect(result.user.updatedAt).not.toBe(result.user.createdAt);
            });

            it('应该验证更新数据', async () => {
                const userId = 'user123';
                const invalidUpdateData = {
                    email: 'invalid-email', // 无效邮箱
                    phone: '123' // 无效手机号
                };

                const validation = this.userValidator.validateUserUpdate(invalidUpdateData);

                expect(validation.isValid).toBe(false);
                expect(validation.errors).toContain('邮箱格式无效');
                expect(validation.errors).toContain('手机号格式无效');
            });

            it('应该处理密码更新', async () => {
                const userId = 'user123';
                const passwordUpdate = {
                    currentPassword: 'OldPassword123!',
                    newPassword: 'NewPassword123!'
                };

                const result = await this.userService.updatePassword(userId, passwordUpdate);

                expect(result.success).toBe(true);
                expect(result.user.password).not.toBe('NewPassword123!'); // 新密码应该被哈希
            });

            it('应该验证当前密码', async () => {
                const userId = 'user123';
                const passwordUpdate = {
                    currentPassword: 'WrongPassword123!',
                    newPassword: 'NewPassword123!'
                };

                const result = await this.userService.updatePassword(userId, passwordUpdate);

                expect(result.success).toBe(false);
                expect(result.error).toContain('当前密码错误');
            });

            it('应该记录更新历史', async () => {
                const userId = 'user123';
                const updateData = { phone: '13800138000' };

                const result = await this.userService.updateUser(userId, updateData);

                expect(result.success).toBe(true);
                expect(result.updateHistory).toBeDefined();
                expect(result.updateHistory.length).toBeGreaterThan(0);
                expect(result.updateHistory[0].field).toBe('phone');
            });
        });
    }

    /**
     * 测试用户权限管理功能
     */
    testUserPermissions() {
        describe('用户权限管理功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该验证用户权限', async () => {
                const userId = 'user123';
                const requiredPermission = 'trip:create';

                const result = await this.userService.checkPermission(userId, requiredPermission);

                expect(result.hasPermission).toBe(true);
                expect(result.userId).toBe(userId);
            });

            it('应该处理权限不足的情况', async () => {
                const userId = 'user123';
                const requiredPermission = 'admin:manage';

                const result = await this.userService.checkPermission(userId, requiredPermission);

                expect(result.hasPermission).toBe(false);
                expect(result.reason).toContain('权限不足');
            });

            it('应该更新用户角色', async () => {
                const userId = 'user123';
                const newRole = 'PREMIUM_USER';

                const result = await this.userService.updateUserRole(userId, newRole);

                expect(result.success).toBe(true);
                expect(result.user.role).toBe(newRole);
            });

            it('应该验证角色权限', async () => {
                const invalidRole = 'INVALID_ROLE';

                const validation = this.userValidator.validateRole(invalidRole);

                expect(validation.isValid).toBe(false);
                expect(validation.error).toContain('无效的用户角色');
            });

            it('应该管理用户状态', async () => {
                const userId = 'user123';

                // 禁用用户
                const disableResult = await this.userService.disableUser(userId);
                expect(disableResult.success).toBe(true);
                expect(disableResult.user.isActive).toBe(false);

                // 启用用户
                const enableResult = await this.userService.enableUser(userId);
                expect(enableResult.success).toBe(true);
                expect(enableResult.user.isActive).toBe(true);
            });

            it('应该获取用户权限列表', async () => {
                const userId = 'user123';

                const result = await this.userService.getUserPermissions(userId);

                expect(result.success).toBe(true);
                expect(Array.isArray(result.permissions)).toBe(true);
                expect(result.permissions.length).toBeGreaterThan(0);
            });
        });
    }

    /**
     * 测试用户控制器功能
     */
    testUserController() {
        describe('用户控制器功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该处理用户注册请求', async () => {
                const request = {
                    body: {
                        username: 'newuser',
                        email: 'new@example.com',
                        password: 'Password123!',
                        firstName: '王',
                        lastName: '五'
                    }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.userController.register(request, response);

                expect(response.status).toHaveBeenCalledWith(201);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        user: expect.any(Object)
                    })
                );
            });

            it('应该处理用户登录请求', async () => {
                const request = {
                    body: {
                        username: 'testuser',
                        password: 'Password123!'
                    }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.userController.login(request, response);

                expect(response.status).toHaveBeenCalledWith(200);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        token: expect.any(String)
                    })
                );
            });

            it('应该处理获取用户信息请求', async () => {
                const request = {
                    params: { id: 'user123' },
                    user: { id: 'user123' }
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.userController.getUser(request, response);

                expect(response.status).toHaveBeenCalledWith(200);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        user: expect.any(Object)
                    })
                );
            });

            it('应该处理权限验证错误', async () => {
                const request = {
                    params: { id: 'otheruser' },
                    user: { id: 'user123' } // 尝试访问其他用户信息
                };

                const response = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

                await this.userController.getUser(request, response);

                expect(response.status).toHaveBeenCalledWith(403);
                expect(response.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.any(String)
                    })
                );
            });
        });
    }

    /**
     * 测试错误处理
     */
    testErrorHandling() {
        describe('用户管理错误处理测试', () => {
            it('应该处理数据库连接错误', async () => {
                // 模拟数据库错误
                jest.spyOn(this.userService, 'registerUser').mockRejectedValue(new Error('数据库连接失败'));

                await expect(this.userService.registerUser({})).rejects.toThrow('数据库连接失败');
            });

            it('应该处理密码哈希错误', async () => {
                // 模拟密码哈希错误
                jest.spyOn(this.userService, 'registerUser').mockRejectedValue(new Error('密码哈希失败'));

                await expect(this.userService.registerUser({
                    username: 'test',
                    email: 'test@test.com',
                    password: 'Password123!'
                })).rejects.toThrow('密码哈希失败');
            });

            it('应该处理Token生成错误', async () => {
                // 模拟Token生成错误
                jest.spyOn(this.userService, 'loginUser').mockRejectedValue(new Error('Token生成失败'));

                await expect(this.userService.loginUser({
                    username: 'testuser',
                    password: 'Password123!'
                })).rejects.toThrow('Token生成失败');
            });

            it('应该处理并发注册冲突', async () => {
                // 模拟并发冲突
                jest.spyOn(this.userService, 'registerUser').mockRejectedValue(new Error('用户注册冲突'));

                await expect(this.userService.registerUser({
                    username: 'test',
                    email: 'test@test.com',
                    password: 'Password123!'
                })).rejects.toThrow('用户注册冲突');
            });
        });
    }

    /**
     * 运行所有用户管理模块测试
     */
    runAllTests() {
        describe('用户管理模块 - 完整测试套件', () => {
            this.testUserRegistration();
            this.testUserLogin();
            this.testUserQuery();
            this.testUserUpdate();
            this.testUserPermissions();
            this.testUserController();
            this.testErrorHandling();
        });
    }
}

/**
 * 创建用户管理测试套件实例
 */
export const createUserTestSuite = () => {
    return new UserTestSuite();
};