// 日志记录器
export const createLogger = (moduleName: string) => {
    const getTimestamp = () => new Date().toISOString()

    return {
        info: (message: string, ...args: any[]) => {
            console.log(`[${getTimestamp()}] [INFO] [${moduleName}] ${message}`, ...args)
        },

        warn: (message: string, ...args: any[]) => {
            console.warn(`[${getTimestamp()}] [WARN] [${moduleName}] ${message}`, ...args)
        },

        error: (message: string, ...args: any[]) => {
            console.error(`[${getTimestamp()}] [ERROR] [${moduleName}] ${message}`, ...args)
        },

        debug: (message: string, ...args: any[]) => {
            if (process.env.NODE_ENV === 'development') {
                console.debug(`[${getTimestamp()}] [DEBUG] [${moduleName}] ${message}`, ...args)
            }
        }
    }
}

// 响应格式化工具
export const responseFormatter = {
    success: (data: any, message: string = '操作成功') => ({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    }),

    error: (message: string, errorCode?: string, details?: any) => ({
        success: false,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString()
    }),

    pagination: (data: any[], total: number, page: number, limit: number) => ({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
    })
}

// 密码工具
export const passwordUtils = {
    // 密码强度验证
    validatePassword: (password: string): { isValid: boolean; message?: string } => {
        if (password.length < 8) {
            return { isValid: false, message: '密码长度至少8位' }
        }

        if (!/(?=.*[a-z])/.test(password)) {
            return { isValid: false, message: '密码必须包含小写字母' }
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            return { isValid: false, message: '密码必须包含大写字母' }
        }

        if (!/(?=.*\d)/.test(password)) {
            return { isValid: false, message: '密码必须包含数字' }
        }

        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
            return { isValid: false, message: '密码必须包含特殊字符' }
        }

        return { isValid: true }
    },

    // 生成随机密码
    generateRandomPassword: (length: number = 12): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:\'"|,.<>/?'
        let password = ''

        // 确保包含各种字符类型
        password += 'A' // 大写字母
        password += 'a' // 小写字母
        password += '1' // 数字
        password += '!' // 特殊字符

        // 生成剩余字符
        for (let i = password.length; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        // 打乱密码顺序
        return password.split('').sort(() => Math.random() - 0.5).join('')
    }
}

// 日期时间工具
export const dateUtils = {
    // 格式化日期
    formatDate: (date: Date, format: string = 'YYYY-MM-DD'): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return format
            .replace('YYYY', String(year))
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds)
    },

    // 计算日期差
    dateDiff: (date1: Date, date2: Date): number => {
        const diffTime = Math.abs(date2.getTime() - date1.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    // 添加天数
    addDays: (date: Date, days: number): Date => {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
    }
}

// 字符串工具
export const stringUtils = {
    // 截断字符串
    truncate: (str: string, length: number, suffix: string = '...'): string => {
        if (str.length <= length) return str
        return str.substring(0, length - suffix.length) + suffix
    },

    // 生成随机字符串
    randomString: (length: number = 16): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''

        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        return result
    },

    // 转换为驼峰命名
    toCamelCase: (str: string): string => {
        return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    },

    // 转换为蛇形命名
    toSnakeCase: (str: string): string => {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    }
}

// 验证工具
export const validationUtils = {
    // 验证邮箱格式
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    },

    // 验证手机号格式（中国）
    isValidPhone: (phone: string): boolean => {
        const phoneRegex = /^1[3-9]\d{9}$/
        return phoneRegex.test(phone)
    },

    // 验证URL格式
    isValidUrl: (url: string): boolean => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }
}

// 导出所有工具
export default {
    createLogger,
    responseFormatter,
    passwordUtils,
    dateUtils,
    stringUtils,
    validationUtils
}