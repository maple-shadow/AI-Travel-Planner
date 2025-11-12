import { DatabaseConnection } from '../../../core/database';
import { UserCredentials } from '../types/auth.types';

/**
 * 用户数据模型
 * 使用Supabase数据库持久化存储用户数据
 */
export class UserModel {
    private static readonly TABLE_NAME = 'users';

    /**
     * 创建用户
     */
    static async createUser(userData: {
        username: string;
        password: string;
        email: string;
    }): Promise<UserCredentials> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        const user: UserCredentials = {
            id: this.generateUserId(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // 注意：这里存储的是哈希后的密码
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const { data, error } = await db
            .from(this.TABLE_NAME)
            .insert([
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    created_at: user.createdAt,
                    updated_at: user.updatedAt
                }
            ])
            .select();

        if (error) {
            throw new Error(`创建用户失败: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('创建用户失败: 未返回数据');
        }

        return user;
    }

    /**
     * 通过邮箱查找用户
     */
    static async findUserByEmail(email: string): Promise<UserCredentials | null> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        const { data, error } = await db
            .from(this.TABLE_NAME)
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // 未找到记录
                return null;
            }
            throw new Error(`查询用户失败: ${error.message}`);
        }

        if (!data) {
            return null;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }

    /**
     * 通过ID查找用户
     */
    static async findUserById(id: string): Promise<UserCredentials | null> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        const { data, error } = await db
            .from(this.TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // 未找到记录
                return null;
            }
            throw new Error(`查询用户失败: ${error.message}`);
        }

        if (!data) {
            return null;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }

    /**
     * 更新用户信息
     */
    static async updateUser(email: string, updateData: Partial<UserCredentials>): Promise<UserCredentials | null> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        const updateFields: any = {
            updated_at: new Date()
        };

        if (updateData.username) updateFields.username = updateData.username;
        if (updateData.password) updateFields.password = updateData.password;

        const { data, error } = await db
            .from(this.TABLE_NAME)
            .update(updateFields)
            .eq('email', email)
            .select()
            .single();

        if (error) {
            throw new Error(`更新用户失败: ${error.message}`);
        }

        if (!data) {
            return null;
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }

    /**
     * 删除用户
     */
    static async deleteUser(email: string): Promise<boolean> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        const { error } = await db
            .from(this.TABLE_NAME)
            .delete()
            .eq('email', email);

        if (error) {
            throw new Error(`删除用户失败: ${error.message}`);
        }

        return true;
    }

    /**
     * 生成用户ID
     */
    private static generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 检查用户表是否存在，如果不存在则创建
     */
    static async ensureTableExists(): Promise<void> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        try {
            // 尝试执行一个简单的查询来检查表是否存在
            const { data, error } = await db
                .from(this.TABLE_NAME)
                .select('count')
                .limit(1);

            if (error) {
                // 如果表不存在（任何错误都可能是表不存在），尝试创建表
                console.log('用户表不存在，正在创建表...');
                await this.createTable();
                console.log('用户表创建成功');
            } else {
                console.log('用户表已存在');
            }
        } catch (error) {
            console.warn('用户表检查异常:', error);
            // 即使有异常，也尝试创建表
            console.log('尝试创建用户表...');
            await this.createTable();
        }
    }

    /**
     * 创建用户表
     */
    private static async createTable(): Promise<void> {
        const dbConnection = DatabaseConnection.getInstance();
        const db = dbConnection.getConnection();
        if (!db) {
            throw new Error('数据库连接未初始化');
        }

        // 使用SQL语句创建表
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        console.warn('⚠️ 用户表不存在，需要手动创建。');
        console.warn('📋 请按照以下步骤在Supabase控制台创建表:');
        console.warn('1. 访问您的Supabase项目: https://ttzirvzwfmynayvruuho.supabase.co');
        console.warn('2. 使用您的GitHub账户登录');
        console.warn('3. 点击左侧菜单的 "SQL Editor"');
        console.warn('4. 复制并执行以下SQL语句:');
        console.warn('');
        console.warn(createTableSQL);
        console.warn('');
        console.warn('5. 或者使用 "Table Editor" 手动创建:');
        console.warn('   - 点击左侧菜单的 "Table Editor"');
        console.warn('   - 点击 "Create a new table"');
        console.warn('   - 表名: users');
        console.warn('   - 添加以下字段:');
        console.warn('     • id (text, primary key)');
        console.warn('     • username (text, unique)');
        console.warn('     • email (text, unique)');
        console.warn('     • password (text)');
        console.warn('     • created_at (timestamp)');
        console.warn('     • updated_at (timestamp)');
        console.warn('');
        console.warn('🔧 创建完成后，重启应用即可正常使用注册功能。');

        // 抛出明确的错误，让调用方知道需要手动干预
        throw new Error('用户表不存在，请按照控制台输出在Supabase中手动创建表');
    }
}