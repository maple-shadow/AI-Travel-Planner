import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { environment } from '../config/index'

// Supabase客户端实例
let supabaseClient: SupabaseClient | null = null

// Supabase数据库连接类
export class SupabaseConnection {
    private static instance: SupabaseConnection
    private client: SupabaseClient | null = null

    private constructor() { }

    public static getInstance(): SupabaseConnection {
        if (!SupabaseConnection.instance) {
            SupabaseConnection.instance = new SupabaseConnection()
        }
        return SupabaseConnection.instance
    }

    // 连接Supabase
    public async connect(): Promise<SupabaseClient> {
        if (this.client) {
            return this.client
        }

        try {
            const { url, anonKey } = environment.thirdParty.supabase

            if (!url || !anonKey) {
                throw new Error('Supabase配置不完整，请检查SUPABASE_URL和SUPABASE_ANON_KEY环境变量')
            }

            this.client = createClient(url, anonKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            })

            console.log('✅ Supabase连接成功')
            supabaseClient = this.client

            return this.client
        } catch (error) {
            console.error('❌ Supabase连接失败:', error)
            throw error
        }
    }

    // 断开连接
    public async disconnect(): Promise<void> {
        if (this.client) {
            // Supabase客户端不需要显式断开连接
            this.client = null
            supabaseClient = null
            console.log('🔌 Supabase连接已断开')
        }
    }

    // 检查连接状态
    public isConnected(): boolean {
        return this.client !== null
    }

    // 获取客户端实例
    public getClient(): SupabaseClient | null {
        return this.client
    }

    // 健康检查
    public async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy'
        message: string
        details?: any
    }> {
        try {
            if (!this.client) {
                return {
                    status: 'unhealthy',
                    message: 'Supabase客户端未连接'
                }
            }

            // 执行简单的查询测试
            const { data, error } = await this.client.from('users').select('count').limit(1)

            if (error) {
                return {
                    status: 'unhealthy',
                    message: 'Supabase健康检查失败',
                    details: error.message
                }
            }

            return {
                status: 'healthy',
                message: 'Supabase连接正常',
                details: {
                    url: environment.thirdParty.supabase.url,
                    tables: ['users', 'trips', 'budgets', 'expenses'] // 预期的表结构
                }
            }
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'Supabase健康检查异常',
                details: error instanceof Error ? error.message : '未知错误'
            }
        }
    }
}

// 初始化Supabase连接
export const setupSupabase = async (): Promise<SupabaseClient> => {
    const db = SupabaseConnection.getInstance()
    return await db.connect()
}

// 导出Supabase客户端实例
export { supabaseClient }

export default SupabaseConnection