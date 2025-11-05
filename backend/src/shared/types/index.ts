import { Request } from 'express'

// 基础类型定义

// 用户信息接口
export interface IUser {
    id: string
    email: string
    firstName: string
    lastName: string
    avatar?: string
    role: string
    preferences?: UserPreferences
    createdAt: Date
    updatedAt: Date
}

// 用户偏好设置
export interface UserPreferences {
    language: string
    currency: string
    timezone: string
    notificationSettings: {
        email: boolean
        push: boolean
        sms: boolean
    }
    travelPreferences: {
        budgetRange: {
            min: number
            max: number
        }
        accommodationType: string[]
        transportationType: string[]
        interests: string[]
    }
}

// 行程接口
export interface ITrip {
    id: string
    userId: string
    title: string
    description?: string
    destination: string
    startDate: Date
    endDate: Date
    status: string
    budget?: number
    participants: number
    tags: string[]
    coverImage?: string
    itinerary?: DayItinerary[]
    createdAt: Date
    updatedAt: Date
}

// 每日行程安排
export interface DayItinerary {
    date: Date
    activities: Activity[]
    accommodation?: Accommodation
    transportation?: Transportation
    notes?: string
}

// 活动接口
export interface Activity {
    id: string
    name: string
    description?: string
    location: string
    startTime: Date
    endTime: Date
    cost?: number
    category: string
    bookingInfo?: BookingInfo
    notes?: string
}

// 住宿信息
export interface Accommodation {
    name: string
    type: string
    address: string
    checkIn: Date
    checkOut: Date
    cost: number
    bookingInfo?: BookingInfo
}

// 交通信息
export interface Transportation {
    type: string
    from: string
    to: string
    departure: Date
    arrival: Date
    cost: number
    bookingInfo?: BookingInfo
}

// 预订信息
export interface BookingInfo {
    confirmationNumber?: string
    provider: string
    contact?: string
    notes?: string
}

// 预算接口
export interface IBudget {
    id: string
    tripId: string
    userId: string
    totalAmount: number
    currency: string
    categories: BudgetCategory[]
    actualSpent: number
    remaining: number
    createdAt: Date
    updatedAt: Date
}

// 预算分类
export interface BudgetCategory {
    category: string
    allocated: number
    spent: number
    remaining: number
    items: BudgetItem[]
}

// 预算项目
export interface BudgetItem {
    id: string
    name: string
    estimatedCost: number
    actualCost?: number
    paid: boolean
    date?: Date
    notes?: string
}

// 费用记录接口
export interface IExpense {
    id: string
    tripId: string
    userId: string
    category: string
    amount: number
    currency: string
    description: string
    date: Date
    location?: string
    receiptImage?: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
}

// API响应类型
export interface ApiResponse<T = any> {
    success: boolean
    message: string
    data?: T
    errorCode?: string
    timestamp: string
}

// 分页响应类型
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

// 错误响应类型
export interface ErrorResponse {
    success: false
    message: string
    errorCode: string
    details?: any
    timestamp: string
}

// 分页查询参数
export interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

// 搜索查询参数
export interface SearchParams extends PaginationParams {
    query?: string
    filters?: Record<string, any>
}

// 认证请求类型
export interface AuthRequest extends Request {
    user?: IUser
}

// JWT载荷类型
export interface JwtPayload {
    userId: string
    email: string
    role: string
    iat?: number
    exp?: number
}