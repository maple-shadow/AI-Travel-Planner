import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authConfig } from '../config/index.js'

// 扩展Request接口以包含user属性
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                email: string
                role: string
            }
        }
    }
}

// 认证中间件
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
        res.status(401).json({
            error: '访问被拒绝，缺少认证令牌',
            message: '请提供有效的JWT令牌'
        })
        return
    }

    try {
        const decoded = jwt.verify(token, authConfig.jwtSecret) as any
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        }
        next()
    } catch (error) {
        res.status(401).json({
            error: '无效的认证令牌',
            message: '令牌已过期或无效'
        })
        return
    }
}

// 验证中间件工厂函数
export const validationMiddleware = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body)

        if (error) {
            res.status(400).json({
                error: '验证失败',
                message: error.details[0].message,
                details: error.details
            })
            return
        }

        next()
    }
}

// 错误处理中间件
export const errorMiddleware = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('错误中间件捕获:', error)

    // JWT认证错误
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: '认证失败',
            message: '无效的认证令牌'
        })
    }

    // JWT过期错误
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: '认证失败',
            message: '认证令牌已过期'
        })
    }

    // 数据库错误
    if (error.name === 'MongoError' || error.code === 11000) {
        return res.status(400).json({
            error: '数据库错误',
            message: '数据操作失败'
        })
    }

    // 默认错误处理
    const statusCode = error.statusCode || 500
    const message = error.message || '内部服务器错误'

    return res.status(statusCode).json({
        error: statusCode === 500 ? '服务器错误' : '请求错误',
        message: process.env.NODE_ENV === 'development' ? message : '发生未知错误'
    })
}

// 日志中间件
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - startTime
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`

        if (res.statusCode >= 400) {
            console.error(logMessage)
        } else {
            console.log(logMessage)
        }
    })

    next()
}

// 请求日志中间件（详细日志）
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
    console.log('请求头:', req.headers)
    console.log('请求体:', req.body)

    next()
}

// CORS中间件配置
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.header('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    next()
}

export default {
    auth: authMiddleware,
    validation: validationMiddleware,
    error: errorMiddleware,
    logging: loggingMiddleware,
    requestLogging: requestLogger,
    cors: corsMiddleware
}