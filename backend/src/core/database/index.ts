import mongoose from 'mongoose'
import { databaseConfig } from '../config/index.js'

// 数据库连接状态
let isConnected = false
let databaseConnection: mongoose.Connection | null = null

// 数据库连接配置
export const migrationConfig = {
    autoIndex: process.env.NODE_ENV === 'development',
    bufferCommands: false,
    maxPoolSize: databaseConfig.maxConnections,
    serverSelectionTimeoutMS: databaseConfig.connectionTimeout,
    socketTimeoutMS: 45000,
    family: 4
}

// 数据库连接类
export class DatabaseConnection {
    private static instance: DatabaseConnection
    private connection: mongoose.Connection | null = null

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection()
        }
        return DatabaseConnection.instance
    }

    // 连接数据库
    public async connect(): Promise<mongoose.Connection> {
        if (this.connection) {
            return this.connection
        }

        try {
            await mongoose.connect(databaseConfig.mongodbUri, migrationConfig)

            this.connection = mongoose.connection
            isConnected = true
            databaseConnection = this.connection

            console.log('✅ 数据库连接成功')

            // 监听连接事件
            this.connection.on('error', (error) => {
                console.error('❌ 数据库连接错误:', error)
                isConnected = false
            })

            this.connection.on('disconnected', () => {
                console.log('⚠️ 数据库连接断开')
                isConnected = false
            })

            this.connection.on('reconnected', () => {
                console.log('✅ 数据库重新连接成功')
                isConnected = true
            })

            return this.connection
        } catch (error) {
            console.error('❌ 数据库连接失败:', error)
            throw error
        }
    }

    // 断开数据库连接
    public async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.disconnect()
            this.connection = null
            isConnected = false
            console.log('🔌 数据库连接已断开')
        }
    }

    // 检查连接状态
    public isConnected(): boolean {
        return isConnected && this.connection?.readyState === 1
    }

    // 获取连接实例
    public getConnection(): mongoose.Connection | null {
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
        const db = DatabaseConnection.getInstance()

        if (!db.isConnected()) {
            return {
                status: 'unhealthy',
                message: '数据库连接异常'
            }
        }

        // 执行简单的查询测试
        const adminDb = db.getConnection()?.db.admin()
        if (adminDb) {
            await adminDb.ping()
        }

        return {
            status: 'healthy',
            message: '数据库连接正常',
            details: {
                readyState: db.getConnection()?.readyState,
                host: db.getConnection()?.host,
                name: db.getConnection()?.name
            }
        }
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
export const setupDatabase = async (): Promise<mongoose.Connection> => {
    const db = DatabaseConnection.getInstance()
    return await db.connect()
}

// 导出数据库连接实例
export { databaseConnection }

export default DatabaseConnection