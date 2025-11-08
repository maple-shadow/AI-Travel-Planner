import { Router } from 'express'
import {
    createTrip,
    getTripById,
    updateTrip,
    deleteTrip,
    getUserTrips,
    searchTrips,
    getUpcomingTrips,
    getTripStats
} from '../controllers/trip.controller'

const router = Router()

// 行程路由配置

/**
 * @route POST /api/trips
 * @description 创建新行程
 * @access Private
 */
router.post('/', createTrip)

/**
 * @route GET /api/trips
 * @description 获取用户行程列表
 * @access Private
 */
router.get('/', getUserTrips)

/**
 * @route GET /api/trips/search
 * @description 搜索行程
 * @access Private
 */
router.get('/search', searchTrips)

/**
 * @route GET /api/trips/upcoming
 * @description 获取即将到来的行程
 * @access Private
 */
router.get('/upcoming', getUpcomingTrips)

/**
 * @route GET /api/trips/stats
 * @description 获取行程统计信息
 * @access Private
 */
router.get('/stats', getTripStats)

/**
 * @route GET /api/trips/:id
 * @description 根据ID获取行程详情
 * @access Private
 */
router.get('/:id', getTripById)

/**
 * @route PUT /api/trips/:id
 * @description 更新行程信息
 * @access Private
 */
router.put('/:id', updateTrip)

/**
 * @route DELETE /api/trips/:id
 * @description 删除行程
 * @access Private
 */
router.delete('/:id', deleteTrip)

// 路由信息
export const routeInfo = {
    basePath: '/api/trips',
    routes: [
        {
            path: '/',
            method: 'POST',
            description: '创建新行程',
            authentication: true
        },
        {
            path: '/',
            method: 'GET',
            description: '获取用户行程列表',
            authentication: true
        },
        {
            path: '/search',
            method: 'GET',
            description: '搜索行程',
            authentication: true
        },
        {
            path: '/upcoming',
            method: 'GET',
            description: '获取即将到来的行程',
            authentication: true
        },
        {
            path: '/stats',
            method: 'GET',
            description: '获取行程统计信息',
            authentication: true
        },
        {
            path: '/:id',
            method: 'GET',
            description: '根据ID获取行程详情',
            authentication: true
        },
        {
            path: '/:id',
            method: 'PUT',
            description: '更新行程信息',
            authentication: true
        },
        {
            path: '/:id',
            method: 'DELETE',
            description: '删除行程',
            authentication: true
        }
    ]
}

export default router