import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 中间件配置
app.use(helmet())
app.use(compression())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP每15分钟最多100个请求
})
app.use(limiter)

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 健康检查路由
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AI旅行规划师后端服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    })
})

// 根路由
app.get('/', (req, res) => {
    res.json({
        message: '欢迎使用AI旅行规划师API服务',
        documentation: '/api/docs',
        health: '/api/health'
    })
})

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        error: '路由不存在',
        path: req.originalUrl
    })
})

// 错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('服务器错误:', error)
    res.status(500).json({
        error: '内部服务器错误',
        message: process.env.NODE_ENV === 'development' ? error.message : '发生未知错误'
    })
})

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`)
    console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 访问地址: http://localhost:${PORT}`)
})

export default app