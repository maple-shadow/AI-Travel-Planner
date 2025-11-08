import { Request, Response } from 'express'
import TripModel from '../models/trip.model'
import TripValidators from '../validators/trip.validators'
import TripTypes from '../types/trip.types'

// 创建行程
export const createTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, title, description, destination, start_date, end_date, status, type, priority, budget, tags } = req.body

        // 验证用户权限（从认证中间件获取的用户ID）
        const authenticatedUserId = req.user?.id
        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        // 验证用户ID匹配
        if (user_id !== authenticatedUserId) {
            res.status(403).json({
                success: false,
                error: '无权为其他用户创建行程'
            })
            return
        }

        // 验证行程数据
        const validationErrors = TripValidators.validateTripData({
            user_id,
            title,
            description,
            destination,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            status,
            type,
            priority,
            budget,
            tags
        })

        if (validationErrors.length > 0) {
            res.status(400).json({
                success: false,
                error: '数据验证失败',
                validationErrors
            })
            return
        }

        // 创建行程
        const tripData = {
            user_id,
            title: title.trim(),
            description: description?.trim(),
            destination: destination.trim(),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            status: status || TripTypes.TripStatus.PLANNING,
            type: type || TripTypes.TripType.LEISURE,
            priority: priority || TripTypes.TripPriority.MEDIUM,
            budget,
            tags
        }

        const newTrip = await TripModel.createTrip(tripData)

        res.status(201).json({
            success: true,
            data: newTrip,
            message: '行程创建成功'
        })
    } catch (error) {
        console.error('创建行程错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '创建行程失败'
        })
    }
}

// 获取行程详情
export const getTripById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const authenticatedUserId = req.user?.id

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        // 验证行程ID
        const idValidationErrors = TripValidators.validateTripId(id as string)
        if (idValidationErrors.length > 0) {
            res.status(400).json({
                success: false,
                error: '无效的行程ID',
                validationErrors: idValidationErrors
            })
            return
        }

        const trip = await TripModel.findTripById(id as string)

        if (!trip) {
            res.status(404).json({
                success: false,
                error: '行程不存在'
            })
            return
        }

        // 检查用户权限
        if (trip.user_id !== authenticatedUserId) {
            res.status(403).json({
                success: false,
                error: '无权访问此行程'
            })
            return
        }

        res.status(200).json({
            success: true,
            data: trip
        })
    } catch (error) {
        console.error('获取行程详情错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '获取行程详情失败'
        })
    }
}

// 更新行程
export const updateTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const updateData = req.body
        const authenticatedUserId = req.user?.id

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        // 验证行程ID
        const idValidationErrors = TripValidators.validateTripId(id as string)
        if (idValidationErrors.length > 0) {
            res.status(400).json({
                success: false,
                error: '无效的行程ID',
                validationErrors: idValidationErrors
            })
            return
        }

        // 检查行程是否存在且用户有权访问
        const existingTrip = await TripModel.findTripById(id as string)
        if (!existingTrip) {
            res.status(404).json({
                success: false,
                error: '行程不存在'
            })
            return
        }

        if (existingTrip.user_id !== authenticatedUserId) {
            res.status(403).json({
                success: false,
                error: '无权更新此行程'
            })
            return
        }

        // 验证更新数据
        const validationErrors = TripValidators.validateTripData(updateData)
        if (validationErrors.length > 0) {
            res.status(400).json({
                success: false,
                error: '数据验证失败',
                validationErrors
            })
            return
        }

        // 处理日期字段
        if (updateData.start_date) {
            updateData.start_date = new Date(updateData.start_date)
        }
        if (updateData.end_date) {
            updateData.end_date = new Date(updateData.end_date)
        }

        const updatedTrip = await TripModel.updateTrip(id as string, updateData)

        res.status(200).json({
            success: true,
            data: updatedTrip,
            message: '行程更新成功'
        })
    } catch (error) {
        console.error('更新行程错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '更新行程失败'
        })
    }
}

// 删除行程
export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const authenticatedUserId = req.user?.id

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        // 验证行程ID
        const idValidationErrors = TripValidators.validateTripId(id as string)
        if (idValidationErrors.length > 0) {
            res.status(400).json({
                success: false,
                error: '无效的行程ID',
                validationErrors: idValidationErrors
            })
            return
        }

        // 检查行程是否存在且用户有权访问
        const existingTrip = await TripModel.findTripById(id as string)
        if (!existingTrip) {
            res.status(404).json({
                success: false,
                error: '行程不存在'
            })
            return
        }

        if (existingTrip.user_id !== authenticatedUserId) {
            res.status(403).json({
                success: false,
                error: '无权删除此行程'
            })
            return
        }

        await TripModel.deleteTrip(id as string)

        res.status(200).json({
            success: true,
            message: '行程删除成功'
        })
    } catch (error) {
        console.error('删除行程错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '删除行程失败'
        })
    }
}

// 获取用户行程列表
export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const authenticatedUserId = req.user?.id
        const {
            status,
            type,
            priority,
            destination,
            start_date_from,
            start_date_to,
            end_date_from,
            end_date_to,
            budget_min,
            budget_max,
            tags,
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        const options = {
            status: status as any,
            limit: parseInt(limit as string),
            offset: (parseInt(page as string) - 1) * parseInt(limit as string)
        }

        const trips = await TripModel.listUserTrips(authenticatedUserId as string, options)

        // 获取总数用于分页
        const totalTrips = await TripModel.listUserTrips(authenticatedUserId)
        const totalCount = totalTrips.length

        res.status(200).json({
            success: true,
            data: {
                trips,
                pagination: {
                    total_count: totalCount,
                    current_page: parseInt(page as string),
                    total_pages: Math.ceil(totalCount / parseInt(limit as string)),
                    has_next: parseInt(page as string) < Math.ceil(totalCount / parseInt(limit as string)),
                    has_prev: parseInt(page as string) > 1
                }
            }
        })
    } catch (error) {
        console.error('获取用户行程列表错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '获取行程列表失败'
        })
    }
}

// 搜索行程
export const searchTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query
        const authenticatedUserId = req.user?.id

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: '搜索关键词不能为空'
            })
            return
        }

        const searchTerm = q.trim()
        const trips = await TripModel.searchTrips(authenticatedUserId, searchTerm)

        res.status(200).json({
            success: true,
            data: trips,
            search_term: searchTerm,
            total_count: trips.length
        })
    } catch (error) {
        console.error('搜索行程错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '搜索行程失败'
        })
    }
}

// 获取即将到来的行程
export const getUpcomingTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const { days = 30 } = req.query
        const authenticatedUserId = req.user?.id

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        const upcomingTrips = await TripModel.getUpcomingTrips(
            authenticatedUserId,
            parseInt(days as string)
        )

        res.status(200).json({
            success: true,
            data: upcomingTrips,
            days: parseInt(days as string),
            total_count: upcomingTrips.length
        })
    } catch (error) {
        console.error('获取即将到来的行程错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '获取即将到来的行程失败'
        })
    }
}

// 获取行程统计
export const getTripStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const authenticatedUserId = req.user?.id

        if (!authenticatedUserId) {
            res.status(401).json({
                success: false,
                error: '用户未认证'
            })
            return
        }

        const allTrips = await TripModel.listUserTrips(authenticatedUserId)

        const stats = {
            total_trips: allTrips.length,
            planning_trips: allTrips.filter(trip => trip.status === TripTypes.TripStatus.PLANNING).length,
            confirmed_trips: allTrips.filter(trip => trip.status === TripTypes.TripStatus.CONFIRMED).length,
            in_progress_trips: allTrips.filter(trip => trip.status === TripTypes.TripStatus.IN_PROGRESS).length,
            completed_trips: allTrips.filter(trip => trip.status === TripTypes.TripStatus.COMPLETED).length,
            cancelled_trips: allTrips.filter(trip => trip.status === TripTypes.TripStatus.CANCELLED).length,
            postponed_trips: allTrips.filter(trip => trip.status === TripTypes.TripStatus.POSTPONED).length,
            total_budget: allTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0),
            average_budget: allTrips.length > 0
                ? allTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / allTrips.length
                : 0
        }

        res.status(200).json({
            success: true,
            data: stats
        })
    } catch (error) {
        console.error('获取行程统计错误:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '获取行程统计失败'
        })
    }
}

export default {
    createTrip,
    getTripById,
    updateTrip,
    deleteTrip,
    getUserTrips,
    searchTrips,
    getUpcomingTrips,
    getTripStats
}