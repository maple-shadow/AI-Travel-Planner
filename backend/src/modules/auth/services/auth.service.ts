import bcrypt from 'bcryptjs';
import { UserCredentials } from '../types/auth.types';

export class AuthService {
    private passwordSaltRounds: number = 12;
    private userCredentials: Map<string, UserCredentials> = new Map();

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

        const user: UserCredentials = {
            id: this.generateUserId(),
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.userCredentials.set(userData.email, user);
        return user;
    }

    /**
     * 通过邮箱查找用户
     */
    public async findUserByEmail(email: string): Promise<UserCredentials | null> {
        return this.userCredentials.get(email) || null;
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
        const user = await this.findUserByEmail(email);
        if (!user) {
            return null;
        }

        const updatedUser: UserCredentials = {
            ...user,
            ...updateData,
            updatedAt: new Date()
        };

        this.userCredentials.set(email, updatedUser);
        return updatedUser;
    }

    /**
     * 删除用户
     */
    public async deleteUser(email: string): Promise<boolean> {
        return this.userCredentials.delete(email);
    }

    /**
     * 生成用户ID
     */
    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取所有用户（仅用于开发调试）
     */
    public getAllUsers(): UserCredentials[] {
        return Array.from(this.userCredentials.values());
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