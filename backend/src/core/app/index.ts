import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { environment } from '../config/index'
import { authMiddleware, validationMiddleware, errorMiddleware, requestLogger, corsMiddleware } from '../middleware/index'
import { createLogger } from '../utils/index'
import { authRoutes } from '../../modules/auth/routes/auth.routes'
import tripRoutes from '../../modules/trips/routes/trip.routes'
import budgetRoutes from '../../modules/budgets/routes/budget.routes'
import { AIRoutes } from '../../modules/ai-services/routes/ai.routes'
import syncRoutes from '../../modules/data-sync/routes/sync.routes'

// 创建日志记录器
const logger = createLogger('App')

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

// 创建Express应用
export const createExpressApp = (): Application => {
    const app = express()
    return app
}

// 配置中间件
export const configureMiddleware = (app: Application): void => {
    // 基础安全中间件
    app.use(helmet())
    app.use(compression())
    app.use(cors({
        origin: environment.server.frontendUrl,
        credentials: true
    }))

    // 速率限制
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 100 // 限制每个IP每15分钟最多100个请求
    })
    app.use(limiter)

    // 请求体解析
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true }))

    // 请求日志
    app.use(requestLogger)
}

// 配置路由
export const configureRoutes = (app: Application): void => {
    // 健康检查路由
    app.get('/api/health', (req: Request, res: Response) => {
        res.status(200).json({
            status: 'OK',
            message: 'AI旅行规划师后端服务运行正常',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        })
    })

    // 根路由
    app.get('/', (req: Request, res: Response) => {
        res.json({
            message: '欢迎使用AI旅行规划师API服务',
            documentation: '/api/docs',
            health: '/api/health'
        })
    })

    // 挂载认证模块路由
    app.use('/api/auth', authRoutes.getRouter())

    // 挂载行程模块路由（需要认证）
    app.use('/api/trips', authMiddleware, tripRoutes)

    // 挂载预算模块路由（需要认证）
    app.use('/api/budgets', authMiddleware, budgetRoutes)

    // 挂载AI服务模块路由（需要认证）
    const aiRoutes = new AIRoutes({
        aliyun: environment.thirdParty.aliyunBailian,
        iflytek: environment.thirdParty.iflytek
    });
    app.use('/api/ai', authMiddleware, aiRoutes.getRoutes())

    // 挂载数据同步模块路由（需要认证）
    app.use('/api/sync', authMiddleware, syncRoutes)

    // 404处理
    app.use('*', (req: Request, res: Response) => {
        res.status(404).json({
            error: '路由不存在',
            path: req.originalUrl
        })
    })
}

// 设置错误处理
export const setupErrorHandling = (app: Application): void => {
    app.use(errorMiddleware)
}

// 启动服务器
export const startServer = async (app: Application): Promise<void> => {
    const PORT = environment.server.port

    return new Promise((resolve) => {
        app.listen(PORT, () => {
            logger.info(`🚀 服务器运行在端口 ${PORT}`)
            logger.info(`📊 环境: ${environment.server.nodeEnv}`)
            logger.info(`🌐 访问地址: http://localhost:${PORT}`)
            resolve()
        })
    })
}

// 健康检查方法
export const healthCheck = async (): Promise<{
    status: 'healthy' | 'unhealthy'
    checks: {
        server: boolean
        database?: boolean
        memory?: boolean
    }
    details?: any
}> => {
    const checks: any = {
        server: true, // 服务器本身是运行的
    }

    try {
        // 检查内存使用
        const memoryUsage = process.memoryUsage()
        const memoryRatio = memoryUsage.heapUsed / memoryUsage.heapTotal
        checks.memory = memoryRatio < 0.8 // 内存使用率低于80%

        // 这里可以添加数据库健康检查等其他检查

        const allHealthy = Object.values(checks).every(check => check === true)

        return {
            status: allHealthy ? 'healthy' : 'unhealthy',
            checks,
            details: {
                memoryUsage: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
                    ratio: Math.round(memoryRatio * 100) + '%'
                },
                uptime: Math.round(process.uptime()) + 's'
            }
        }
    } catch (error) {
        return {
            status: 'unhealthy',
            checks: { server: false },
            details: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export default {
    createExpressApp,
    configureMiddleware,
    configureRoutes,
    setupErrorHandling,
    startServer,
    healthCheck
}