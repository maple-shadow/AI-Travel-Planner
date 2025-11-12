import bcrypt from 'bcryptjs';
import { UserCredentials } from '../types/auth.types';
import { UserModel } from '../models/user.model';

export class AuthService {
    private passwordSaltRounds: number = 12;

    /**
     * 密码哈希
     */
    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.passwordSaltRounds);
    }

    /**
     * 验证密码
     */
    public async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * 创建用户
     */
    public async createUser(userData: {
        username: string;
        password: string;
        email: string;
    }): Promise<UserCredentials> {
        const hashedPassword = await this.hashPassword(userData.password);

        const user = await UserModel.createUser({
            username: userData.username,
            password: hashedPassword,
            email: userData.email
        });

        return user;
    }

    /**
     * 通过邮箱查找用户
     */
    public async findUserByEmail(email: string): Promise<UserCredentials | null> {
        return await UserModel.findUserByEmail(email);
    }

    /**
     * 通过ID查找用户
     */
    public async findUserById(id: string): Promise<UserCredentials | null> {
        return await UserModel.findUserById(id);
    }

    /**
     * 验证用户凭据
     */
    public async validateUserCredentials(email: string, password: string): Promise<UserCredentials | null> {
        const user = await this.findUserByEmail(email);
        if (!user) {
            return null;
        }

        const isValidPassword = await this.validatePassword(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        return user;
    }

    /**
     * 更新用户信息
     */
    public async updateUser(email: string, updateData: Partial<UserCredentials>): Promise<UserCredentials | null> {
        return await UserModel.updateUser(email, updateData);
    }

    /**
     * 删除用户
     */
    public async deleteUser(email: string): Promise<boolean> {
        return await UserModel.deleteUser(email);
    }

    /**
     * 获取所有用户（仅用于开发调试）
     */
    public async getAllUsers(): Promise<UserCredentials[]> {
        // 注意：这个方法仅用于开发调试，生产环境应该移除
        console.warn('getAllUsers方法仅用于开发调试，生产环境应该移除');

        // 由于Supabase没有直接获取所有用户的方法，这里返回空数组
        // 实际开发中可以通过其他方式实现
        return [];
    }

    /**
     * 验证用户名格式
     */
    public validateUsername(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    /**
     * 验证邮箱格式
     */
    public validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 验证密码强度
     */
    public validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('密码长度至少8个字符');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('密码必须包含小写字母');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('密码必须包含大写字母');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('密码必须包含数字');
        }

        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
            errors.push('密码必须包含特殊字符');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}