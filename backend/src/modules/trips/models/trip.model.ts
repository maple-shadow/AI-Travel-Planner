import { databaseConnection } from '../../../core/database'
import { TripStatus, TripType, TripPriority } from '../types/trip.types'

export interface TripData {
    id?: string
    user_id: string
    title: string
    description?: string
    destination: string
    start_date: Date
    end_date: Date
    status: TripStatus
    type: TripType
    priority: TripPriority
    budget?: number
    tags?: string[]
    created_at?: Date
    updated_at?: Date
}

export class TripModel {
    private static tableName = 'trips'

    // 创建行程
    static async createTrip(tripData: Omit<TripData, 'id' | 'created_at' | 'updated_at'>): Promise<TripData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                ...tripData,
                created_at: new Date(),
                updated_at: new Date()
            })
            .select()
            .single()

        if (error) {
            throw new Error(`创建行程失败: ${error.message}`)
        }

        return data as TripData
    }

    // 根据ID查找行程
    static async findTripById(id: string): Promise<TripData | null> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null // 未找到记录
            }
            throw new Error(`查找行程失败: ${error.message}`)
        }

        return data as TripData
    }

    // 更新行程
    static async updateTrip(id: string, updateData: Partial<Omit<TripData, 'id' | 'user_id' | 'created_at'>>): Promise<TripData> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...updateData,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw new Error(`更新行程失败: ${error.message}`)
        }

        return data as TripData
    }

    // 删除行程
    static async deleteTrip(id: string): Promise<boolean> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(`删除行程失败: ${error.message}`)
        }

        return true
    }

    // 列出用户行程
    static async listUserTrips(userId: string, options?: {
        status?: TripStatus
        limit?: number
        offset?: number
    }): Promise<TripData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }

        if (options?.limit) {
            query = query.limit(options.limit)
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`获取用户行程列表失败: ${error.message}`)
        }

        return data as TripData[]
    }

    // 搜索行程
    static async searchTrips(userId: string, searchTerm: string): Promise<TripData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false })

        if (error) {
            throw new Error(`搜索行程失败: ${error.message}`)
        }

        return data as TripData[]
    }

    // 按状态筛选行程
    static async filterTripsByStatus(userId: string, status: TripStatus): Promise<TripData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .eq('status', status)
            .order('created_at', { ascending: false })

        if (error) {
            throw new Error(`按状态筛选行程失败: ${error.message}`)
        }

        return data as TripData[]
    }

    // 获取即将到来的行程
    static async getUpcomingTrips(userId: string, days: number = 30): Promise<TripData[]> {
        const supabase = databaseConnection
        if (!supabase) {
            throw new Error('数据库连接未初始化')
        }

        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + days)

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .gte('start_date', startDate.toISOString())
            .lte('start_date', endDate.toISOString())
            .order('start_date', { ascending: true })

        if (error) {
            throw new Error(`获取即将到来的行程失败: ${error.message}`)
        }

        return data as TripData[]
    }
}

export default TripModel