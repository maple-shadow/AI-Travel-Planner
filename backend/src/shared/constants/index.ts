// 应用常量
export const APP_CONSTANTS = {
    APP_NAME: 'AI旅行规划师',
    VERSION: '1.0.0',
    DESCRIPTION: '智能旅行规划与管理平台'
}

// HTTP状态码
export const HTTP_STATUS = {
    // 成功状态码
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // 客户端错误
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // 服务器错误
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503
}

// 错误代码
export const ERROR_CODES = {
    // 认证相关
    AUTH_INVALID_TOKEN: 'AUTH_001',
    AUTH_TOKEN_EXPIRED: 'AUTH_002',
    AUTH_INVALID_CREDENTIALS: 'AUTH_003',
    AUTH_USER_NOT_FOUND: 'AUTH_004',
    AUTH_USER_ALREADY_EXISTS: 'AUTH_005',

    // 验证相关
    VALIDATION_FAILED: 'VALID_001',
    VALIDATION_REQUIRED_FIELD: 'VALID_002',
    VALIDATION_INVALID_FORMAT: 'VALID_003',

    // 数据库相关
    DB_CONNECTION_ERROR: 'DB_001',
    DB_QUERY_ERROR: 'DB_002',
    DB_DUPLICATE_KEY: 'DB_003',

    // 业务逻辑相关
    TRIP_NOT_FOUND: 'TRIP_001',
    TRIP_ACCESS_DENIED: 'TRIP_002',
    BUDGET_EXCEEDED: 'BUDGET_001',

    // 第三方服务相关
    THIRD_PARTY_SERVICE_ERROR: 'EXT_001',
    API_RATE_LIMIT_EXCEEDED: 'EXT_002',

    // 系统相关
    INTERNAL_ERROR: 'SYS_001',
    CONFIGURATION_ERROR: 'SYS_002'
}

// 用户角色
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
}

// 行程状态
export const TRIP_STATUS = {
    DRAFT: 'draft',
    PLANNING: 'planning',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
}

// 预算类型
export const BUDGET_TYPES = {
    TRANSPORTATION: 'transportation',
    ACCOMMODATION: 'accommodation',
    FOOD: 'food',
    ACTIVITIES: 'activities',
    SHOPPING: 'shopping',
    OTHER: 'other'
}

// 费用类别
export const EXPENSE_CATEGORIES = {
    FLIGHT: 'flight',
    TRAIN: 'train',
    BUS: 'bus',
    TAXI: 'taxi',
    HOTEL: 'hotel',
    HOSTEL: 'hostel',
    RESTAURANT: 'restaurant',
    GROCERIES: 'groceries',
    ATTRACTION: 'attraction',
    SHOPPING: 'shopping',
    INSURANCE: 'insurance',
    VISA: 'visa',
    OTHER: 'other'
}

// 货币代码
export const CURRENCY_CODES = {
    CNY: 'CNY', // 人民币
    USD: 'USD', // 美元
    EUR: 'EUR', // 欧元
    JPY: 'JPY', // 日元
    KRW: 'KRW', // 韩元
    THB: 'THB', // 泰铢
    SGD: 'SGD', // 新加坡元
    MYR: 'MYR', // 马来西亚林吉特
    IDR: 'IDR', // 印尼盾
    VND: 'VND', // 越南盾
    AUD: 'AUD', // 澳元
    CAD: 'CAD', // 加元
    GBP: 'GBP'  // 英镑
}

// 默认配置
export const DEFAULT_CONFIG = {
    PAGINATION: {
        PAGE: 1,
        LIMIT: 20,
        MAX_LIMIT: 100
    },

    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128
    },

    JWT: {
        EXPIRES_IN: '7d'
    },

    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15分钟
        MAX_REQUESTS: 100
    }
}

// 正则表达式
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^1[3-9]\d{9}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/
}

// 文件相关常量
export const FILE_CONSTANTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

// API路由前缀
export const API_PREFIXES = {
    AUTH: '/api/auth',
    USERS: '/api/users',
    TRIPS: '/api/trips',
    BUDGETS: '/api/budgets',
    EXPENSES: '/api/expenses',
    AI: '/api/ai'
}

export default {
    APP_CONSTANTS,
    HTTP_STATUS,
    ERROR_CODES,
    USER_ROLES,
    TRIP_STATUS,
    BUDGET_TYPES,
    EXPENSE_CATEGORIES,
    CURRENCY_CODES,
    DEFAULT_CONFIG,
    REGEX_PATTERNS,
    FILE_CONSTANTS,
    API_PREFIXES
}