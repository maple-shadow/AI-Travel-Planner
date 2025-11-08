import { CreateTripData, UpdateTripData, TripStatus, TripType, TripPriority, TripValidationError } from '../types/trip.types'

// 验证行程数据
export const validateTripData = (tripData: CreateTripData | UpdateTripData): TripValidationError[] => {
    const errors: TripValidationError[] = []

    // 验证标题
    if ('title' in tripData && tripData.title) {
        if (tripData.title.trim().length === 0) {
            errors.push({
                field: 'title',
                message: '行程标题不能为空',
                code: 'TITLE_REQUIRED'
            })
        } else if (tripData.title.length > 100) {
            errors.push({
                field: 'title',
                message: '行程标题不能超过100个字符',
                code: 'TITLE_TOO_LONG'
            })
        }
    }

    // 验证目的地
    if ('destination' in tripData && tripData.destination) {
        if (tripData.destination.trim().length === 0) {
            errors.push({
                field: 'destination',
                message: '目的地不能为空',
                code: 'DESTINATION_REQUIRED'
            })
        } else if (tripData.destination.length > 200) {
            errors.push({
                field: 'destination',
                message: '目的地不能超过200个字符',
                code: 'DESTINATION_TOO_LONG'
            })
        }
    }

    // 验证描述
    if ('description' in tripData && tripData.description) {
        if (tripData.description.length > 1000) {
            errors.push({
                field: 'description',
                message: '描述不能超过1000个字符',
                code: 'DESCRIPTION_TOO_LONG'
            })
        }
    }

    // 验证日期
    if ('start_date' in tripData && tripData.start_date) {
        const startDate = new Date(tripData.start_date)
        const now = new Date()

        if (isNaN(startDate.getTime())) {
            errors.push({
                field: 'start_date',
                message: '开始日期格式无效',
                code: 'INVALID_START_DATE'
            })
        } else if (startDate < now) {
            errors.push({
                field: 'start_date',
                message: '开始日期不能早于当前时间',
                code: 'START_DATE_IN_PAST'
            })
        }
    }

    if ('end_date' in tripData && tripData.end_date) {
        const endDate = new Date(tripData.end_date)

        if (isNaN(endDate.getTime())) {
            errors.push({
                field: 'end_date',
                message: '结束日期格式无效',
                code: 'INVALID_END_DATE'
            })
        }
    }

    // 验证日期关系
    if ('start_date' in tripData && tripData.start_date && 'end_date' in tripData && tripData.end_date) {
        const startDate = new Date(tripData.start_date)
        const endDate = new Date(tripData.end_date)

        if (startDate >= endDate) {
            errors.push({
                field: 'end_date',
                message: '结束日期必须晚于开始日期',
                code: 'END_DATE_BEFORE_START'
            })
        }

        // 验证行程时长（不超过2年）
        const maxDuration = 2 * 365 * 24 * 60 * 60 * 1000 // 2年
        if (endDate.getTime() - startDate.getTime() > maxDuration) {
            errors.push({
                field: 'end_date',
                message: '行程时长不能超过2年',
                code: 'TRIP_DURATION_TOO_LONG'
            })
        }
    }

    // 验证状态
    if ('status' in tripData && tripData.status) {
        if (!Object.values(TripStatus).includes(tripData.status)) {
            errors.push({
                field: 'status',
                message: '无效的行程状态',
                code: 'INVALID_STATUS'
            })
        }
    }

    // 验证类型
    if ('type' in tripData && tripData.type) {
        if (!Object.values(TripType).includes(tripData.type)) {
            errors.push({
                field: 'type',
                message: '无效的行程类型',
                code: 'INVALID_TYPE'
            })
        }
    }

    // 验证优先级
    if ('priority' in tripData && tripData.priority) {
        if (!Object.values(TripPriority).includes(tripData.priority)) {
            errors.push({
                field: 'priority',
                message: '无效的优先级',
                code: 'INVALID_PRIORITY'
            })
        }
    }

    // 验证预算
    if ('budget' in tripData && tripData.budget !== undefined) {
        if (tripData.budget < 0) {
            errors.push({
                field: 'budget',
                message: '预算不能为负数',
                code: 'NEGATIVE_BUDGET'
            })
        } else if (tripData.budget > 10000000) { // 1000万
            errors.push({
                field: 'budget',
                message: '预算不能超过1000万',
                code: 'BUDGET_TOO_HIGH'
            })
        }
    }

    // 验证标签
    if ('tags' in tripData && tripData.tags) {
        if (!Array.isArray(tripData.tags)) {
            errors.push({
                field: 'tags',
                message: '标签必须是数组',
                code: 'TAGS_NOT_ARRAY'
            })
        } else if (tripData.tags.length > 10) {
            errors.push({
                field: 'tags',
                message: '标签数量不能超过10个',
                code: 'TOO_MANY_TAGS'
            })
        } else {
            for (const tag of tripData.tags) {
                if (typeof tag !== 'string') {
                    errors.push({
                        field: 'tags',
                        message: '标签必须是字符串',
                        code: 'INVALID_TAG_TYPE'
                    })
                } else if (tag.length > 20) {
                    errors.push({
                        field: 'tags',
                        message: '单个标签不能超过20个字符',
                        code: 'TAG_TOO_LONG'
                    })
                }
            }
        }
    }

    return errors
}

// 验证行程日期
export const validateTripDates = (startDate: Date, endDate: Date): TripValidationError[] => {
    const errors: TripValidationError[] = []
    const now = new Date()

    if (isNaN(startDate.getTime())) {
        errors.push({
            field: 'start_date',
            message: '开始日期格式无效',
            code: 'INVALID_START_DATE'
        })
    }

    if (isNaN(endDate.getTime())) {
        errors.push({
            field: 'end_date',
            message: '结束日期格式无效',
            code: 'INVALID_END_DATE'
        })
    }

    if (startDate < now) {
        errors.push({
            field: 'start_date',
            message: '开始日期不能早于当前时间',
            code: 'START_DATE_IN_PAST'
        })
    }

    if (startDate >= endDate) {
        errors.push({
            field: 'end_date',
            message: '结束日期必须晚于开始日期',
            code: 'END_DATE_BEFORE_START'
        })
    }

    // 验证行程时长（不超过2年）
    const maxDuration = 2 * 365 * 24 * 60 * 60 * 1000 // 2年
    if (endDate.getTime() - startDate.getTime() > maxDuration) {
        errors.push({
            field: 'end_date',
            message: '行程时长不能超过2年',
            code: 'TRIP_DURATION_TOO_LONG'
        })
    }

    return errors
}

// 验证行程预算
export const validateTripBudget = (budget: number): TripValidationError[] => {
    const errors: TripValidationError[] = []

    if (budget < 0) {
        errors.push({
            field: 'budget',
            message: '预算不能为负数',
            code: 'NEGATIVE_BUDGET'
        })
    }

    if (budget > 10000000) { // 1000万
        errors.push({
            field: 'budget',
            message: '预算不能超过1000万',
            code: 'BUDGET_TOO_HIGH'
        })
    }

    return errors
}

// 验证行程ID
export const validateTripId = (id: string): TripValidationError[] => {
    const errors: TripValidationError[] = []

    if (!id || id.trim().length === 0) {
        errors.push({
            field: 'id',
            message: '行程ID不能为空',
            code: 'ID_REQUIRED'
        })
    }

    // UUID格式验证（简化版）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
        errors.push({
            field: 'id',
            message: '无效的行程ID格式',
            code: 'INVALID_ID_FORMAT'
        })
    }

    return errors
}

// 验证用户ID
export const validateUserId = (userId: string): TripValidationError[] => {
    const errors: TripValidationError[] = []

    if (!userId || userId.trim().length === 0) {
        errors.push({
            field: 'user_id',
            message: '用户ID不能为空',
            code: 'USER_ID_REQUIRED'
        })
    }

    // UUID格式验证（简化版）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
        errors.push({
            field: 'user_id',
            message: '无效的用户ID格式',
            code: 'INVALID_USER_ID_FORMAT'
        })
    }

    return errors
}

export default {
    validateTripData,
    validateTripDates,
    validateTripBudget,
    validateTripId,
    validateUserId
}