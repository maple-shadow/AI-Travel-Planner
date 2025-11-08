import { SupabaseConnection, setupSupabase } from './supabase'
import { SupabaseClient } from '@supabase/supabase-js'

// 数据库连接状态
let isConnected = false
let databaseConnection: SupabaseClient | null = null

// 数据库连接类
export class DatabaseConnection {
    private static instance: DatabaseConnection
    private connection: SupabaseClient | null = null

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection()
        }
        return DatabaseConnection.instance
    }

    // 连接数据库
    public async connect(): Promise<SupabaseClient> {
        if (this.connection) {
            return this.connection
        }

        try {
            const supabase = SupabaseConnection.getInstance()
            this.connection = await supabase.connect()
            isConnected = true
            databaseConnection = this.connection

            console.log('✅ Supabase数据库连接成功')

            return this.connection
        } catch (error) {
            console.error('❌ Supabase数据库连接失败:', error)
            throw error
        }
    }

    // 断开数据库连接
    public async disconnect(): Promise<void> {
        if (this.connection) {
            const supabase = SupabaseConnection.getInstance()
            await supabase.disconnect()
            this.connection = null
            isConnected = false
            console.log('🔌 Supabase数据库连接已断开')
        }
    }

    // 检查连接状态
    public isConnected(): boolean {
        return isConnected && this.connection !== null
    }

    // 获取连接实例
    public getConnection(): SupabaseClient | null {
        return this.connection
    }
}

// 数据库健康检查
export const healthCheck = async (): Promise<{
    status: 'healthy' | 'unhealthy'
    message: string
    details?: any
}> => {
    try {
        const supabase = SupabaseConnection.getInstance()
        return await supabase.healthCheck()
    } catch (error) {
        return {
            status: 'unhealthy',
            message: '数据库健康检查失败',
            details: error instanceof Error ? error.message : '未知错误'
        }
    }
}

// 数据模型集合
export const databaseModels = {
    // 用户模型
    User: null,
    // 行程模型
    Trip: null,
    // 预算模型
    Budget: null,
    // 费用记录模型
    Expense: null
}

// 初始化数据库连接
export const setupDatabase = async (): Promise<SupabaseClient> => {
    const db = DatabaseConnection.getInstance()
    return await db.connect()
}

// 导出数据库连接实例
export { databaseConnection }

export default DatabaseConnection