import dotenv from 'dotenv'
import { environment } from './core/config/index'
import appConfig from './core/app/index'
import { setupDatabase } from './core/database/index'
import { createLogger } from './core/utils/index'

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

        // 设置数据库连接（延迟连接，允许应用在没有数据库的情况下启动）
        try {
            await setupDatabase()
            logger.info('数据库连接成功')

            // 初始化用户表
            try {
                const { UserModel } = await import('./modules/auth/models/user.model')
                await UserModel.ensureTableExists()
                logger.info('用户表初始化完成')
            } catch (error) {
                logger.warn('用户表初始化失败，用户注册功能可能受限:', error)
            }

            // 初始化预算表
            try {
                const { BudgetModel } = await import('./modules/budgets/models/budget.model')
                await BudgetModel.ensureTableExists()
                logger.info('预算表初始化完成')
            } catch (error) {
                logger.warn('预算表初始化失败，预算功能可能受限:', error)
            }

            // 初始化开销表
            try {
                const { ExpenseModel } = await import('./modules/budgets/models/expense.model')
                await ExpenseModel.ensureTableExists()
                logger.info('开销表初始化完成')
            } catch (error) {
                logger.warn('开销表初始化失败，开销功能可能受限:', error)
            }

            // 初始化行程表
            try {
                const { initializeTripModule } = await import('./modules/trips')
                await initializeTripModule()
                logger.info('行程表初始化完成')
            } catch (error) {
                logger.warn('行程表初始化失败，行程功能可能受限:', error)
            }
        } catch (error) {
            logger.warn('数据库连接失败，应用将继续运行但部分功能可能受限:', error)
        }

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