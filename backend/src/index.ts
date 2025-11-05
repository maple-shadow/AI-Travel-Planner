import dotenv from 'dotenv'
import { environment } from './core/config/index.js'
import appConfig from './core/app/index.js'
import { setupDatabase } from './core/database/index.js'
import { createLogger } from './core/utils/index.js'

// 创建日志记录器
const logger = createLogger('Server')

// 加载环境变量
dotenv.config()

async function bootstrap() {
    try {
        logger.info('正在启动AI旅行规划师后端服务...')

        // 验证环境变量
        environment.validate()
        logger.info('环境变量验证通过')

        // 创建Express应用
        const app = appConfig.createExpressApp()

        // 配置中间件
        appConfig.configureMiddleware(app)

        // 配置路由
        appConfig.configureRoutes(app)

        // 设置数据库连接
        await setupDatabase()
        logger.info('数据库连接成功')

        // 设置错误处理
        appConfig.setupErrorHandling(app)

        // 启动服务器
        await appConfig.startServer(app)

        logger.info('后端服务启动完成')

    } catch (error) {
        logger.error('服务启动失败:', error)
        process.exit(1)
    }
}

// 启动应用
bootstrap()

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error)
    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝:', reason)
    process.exit(1)
})

export default bootstrap