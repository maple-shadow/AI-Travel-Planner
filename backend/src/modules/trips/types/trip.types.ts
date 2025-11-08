// 行程状态枚举
export enum TripStatus {
    PLANNING = 'planning',      // 规划中
    CONFIRMED = 'confirmed',    // 已确认
    IN_PROGRESS = 'in_progress', // 进行中
    COMPLETED = 'completed',    // 已完成
    CANCELLED = 'cancelled',    // 已取消
    POSTPONED = 'postponed'     // 已延期
}

// 行程类型枚举
export enum TripType {
    BUSINESS = 'business',      // 商务旅行
    LEISURE = 'leisure',       // 休闲旅行
    FAMILY = 'family',         // 家庭旅行
    ADVENTURE = 'adventure',   // 冒险旅行
    EDUCATIONAL = 'educational', // 教育旅行
    OTHER = 'other'            // 其他
}

// 行程优先级枚举
export enum TripPriority {
    LOW = 'low',               // 低优先级
    MEDIUM = 'medium',         // 中优先级
    HIGH = 'high',             // 高优先级
    URGENT = 'urgent'          // 紧急
}

// 行程数据接口
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

// 行程创建数据接口
export interface CreateTripData {
    user_id: string
    title: string
    description?: string
    destination: string
    start_date: Date
    end_date: Date
    status?: TripStatus
    type?: TripType
    priority?: TripPriority
    budget?: number
    tags?: string[]
}

// 行程更新数据接口
export interface UpdateTripData {
    title?: string
    description?: string
    destination?: string
    start_date?: Date
    end_date?: Date
    status?: TripStatus
    type?: TripType
    priority?: TripPriority
    budget?: number
    tags?: string[]
}

// 行程查询条件接口
export interface TripQueryOptions {
    status?: TripStatus
    type?: TripType
    priority?: TripPriority
    destination?: string
    start_date_from?: Date
    start_date_to?: Date
    end_date_from?: Date
    end_date_to?: Date
    budget_min?: number
    budget_max?: number
    tags?: string[]
    limit?: number
    offset?: number
    sort_by?: 'created_at' | 'start_date' | 'title' | 'priority'
    sort_order?: 'asc' | 'desc'
}

// 行程统计信息接口
export interface TripStats {
    total_trips: number
    planning_trips: number
    confirmed_trips: number
    in_progress_trips: number
    completed_trips: number
    cancelled_trips: number
    postponed_trips: number
    total_budget: number
    average_budget: number
}

// 行程验证错误接口
export interface TripValidationError {
    field: string
    message: string
    code: string
}

// 行程操作结果接口
export interface TripOperationResult {
    success: boolean
    data?: TripData | TripData[]
    error?: string
    validationErrors?: TripValidationError[]
}

// 行程列表响应接口
export interface TripListResponse {
    trips: TripData[]
    total_count: number
    current_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

// 默认导出
export default {
    TripStatus,
    TripType,
    TripPriority
}