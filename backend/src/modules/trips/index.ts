import TripModel from './models/trip.model'
import * as TripTypes from './types/trip.types'
import * as TripValidators from './validators/trip.validators'
import * as TripMigrations from './migrations/create_trips_table'
import tripRoutes from './routes/trip.routes'

// 行程模块导出
export {
    TripModel,
    TripTypes,
    TripValidators,
    TripMigrations,
    tripRoutes
}

// 默认导出
export default {
    TripModel,
    TripTypes,
    TripValidators,
    TripMigrations,
    tripRoutes
}

// 模块信息
export const moduleInfo = {
    name: '行程数据模型模块',
    version: '1.0.0',
    description: '提供行程相关的数据模型、验证器和数据库操作功能',
    dependencies: ['后端核心架构模块 (模块03)']
}

// 模块初始化函数
export const initializeTripModule = async (): Promise<boolean> => {
    try {
        console.log('🚀 初始化行程数据模型模块...')

        // 检查数据库连接
        const { databaseConnection } = await import('../../core/database')
        if (!databaseConnection) {
            throw new Error('数据库连接未初始化，请先初始化数据库')
        }

        // 运行数据库迁移
        await TripMigrations.runMigration(databaseConnection)

        console.log('✅ 行程数据模型模块初始化完成')
        return true
    } catch (error) {
        console.error('❌ 行程数据模型模块初始化失败:', error)
        throw error
    }
}

// 模块健康检查
export const healthCheck = async (): Promise<{
    status: 'healthy' | 'unhealthy'
    message: string
    details?: any
}> => {
    try {
        const { databaseConnection } = await import('../../core/database')

        if (!databaseConnection) {
            return {
                status: 'unhealthy',
                message: '数据库连接未初始化'
            }
        }

        // 检查行程表是否存在
        const tableExists = await TripMigrations.checkTripsTableExists(databaseConnection)

        if (!tableExists) {
            return {
                status: 'unhealthy',
                message: '行程表不存在'
            }
        }

        // 测试基本查询
        const { data, error } = await databaseConnection
            .from('trips')
            .select('count')
            .limit(1)

        if (error) {
            return {
                status: 'unhealthy',
                message: '行程表查询失败',
                details: error.message
            }
        }

        return {
            status: 'healthy',
            message: '行程数据模型模块运行正常'
        }
    } catch (error) {
        return {
            status: 'unhealthy',
            message: '行程数据模型模块健康检查失败',
            details: error instanceof Error ? error.message : '未知错误'
        }
    }
}

// 模块使用示例
export const usageExamples = {
    createTrip: `
import { TripModel, TripTypes } from './modules/trips'

const newTrip = await TripModel.createTrip({
  user_id: 'user-uuid',
  title: '北京三日游',
  destination: '北京',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-03'),
  status: TripTypes.TripStatus.PLANNING,
  type: TripTypes.TripType.LEISURE,
  priority: TripTypes.TripPriority.MEDIUM,
  budget: 5000,
  tags: ['文化', '历史']
})
  `,

    findTrip: `
const trip = await TripModel.findTripById('trip-uuid')
  `,

    validateTrip: `
import { TripValidators } from './modules/trips'

const errors = TripValidators.validateTripData({
  title: '测试行程',
  destination: '上海',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-03')
})

if (errors.length > 0) {
  console.error('验证失败:', errors)
}
  `
}

console.log(`📦 ${moduleInfo.name} v${moduleInfo.version} 已加载`)
console.log(`📝 ${moduleInfo.description}`)