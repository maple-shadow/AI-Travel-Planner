import Joi from 'joi'
import {
    USER_ROLES,
    TRIP_STATUS,
    BUDGET_TYPES,
    EXPENSE_CATEGORIES,
    CURRENCY_CODES,
    REGEX_PATTERNS
} from '../constants/index.js'

// 基础验证器

// 用户注册验证
export const registerValidator = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': '请输入有效的邮箱地址',
            'any.required': '邮箱是必填项'
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(REGEX_PATTERNS.PASSWORD)
        .required()
        .messages({
            'string.min': '密码长度至少8位',
            'string.max': '密码长度不能超过128位',
            'string.pattern.base': '密码必须包含大小写字母、数字和特殊字符',
            'any.required': '密码是必填项'
        }),

    firstName: Joi.string()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.min': '名字不能为空',
            'string.max': '名字长度不能超过50个字符',
            'any.required': '名字是必填项'
        }),

    lastName: Joi.string()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.min': '姓氏不能为空',
            'string.max': '姓氏长度不能超过50个字符',
            'any.required': '姓氏是必填项'
        })
})

// 用户登录验证
export const loginValidator = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': '请输入有效的邮箱地址',
            'any.required': '邮箱是必填项'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': '密码是必填项'
        })
})

// 用户信息更新验证
export const updateUserValidator = Joi.object({
    firstName: Joi.string()
        .min(1)
        .max(50)
        .optional(),

    lastName: Joi.string()
        .min(1)
        .max(50)
        .optional(),

    avatar: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': '头像链接必须是有效的URL'
        })
})

// 行程创建验证
export const createTripValidator = Joi.object({
    title: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': '行程标题不能为空',
            'string.max': '行程标题长度不能超过100个字符',
            'any.required': '行程标题是必填项'
        }),

    description: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.max': '行程描述长度不能超过500个字符'
        }),

    destination: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': '目的地不能为空',
            'string.max': '目的地长度不能超过100个字符',
            'any.required': '目的地是必填项'
        }),

    startDate: Joi.date()
        .greater('now')
        .required()
        .messages({
            'date.greater': '开始日期必须大于当前日期',
            'any.required': '开始日期是必填项'
        }),

    endDate: Joi.date()
        .greater(Joi.ref('startDate'))
        .required()
        .messages({
            'date.greater': '结束日期必须大于开始日期',
            'any.required': '结束日期是必填项'
        }),

    budget: Joi.number()
        .min(0)
        .optional()
        .messages({
            'number.min': '预算不能为负数'
        }),

    participants: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(1)
        .messages({
            'number.min': '参与人数至少为1人',
            'number.max': '参与人数不能超过50人'
        }),

    tags: Joi.array()
        .items(Joi.string().max(20))
        .max(10)
        .default([])
        .messages({
            'array.max': '标签数量不能超过10个'
        })
})

// 行程更新验证
export const updateTripValidator = Joi.object({
    title: Joi.string()
        .min(1)
        .max(100)
        .optional(),

    description: Joi.string()
        .max(500)
        .optional(),

    destination: Joi.string()
        .min(1)
        .max(100)
        .optional(),

    startDate: Joi.date()
        .greater('now')
        .optional(),

    endDate: Joi.date()
        .greater(Joi.ref('startDate'))
        .optional(),

    budget: Joi.number()
        .min(0)
        .optional(),

    participants: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .optional(),

    tags: Joi.array()
        .items(Joi.string().max(20))
        .max(10)
        .optional(),

    status: Joi.string()
        .valid(...Object.values(TRIP_STATUS))
        .optional()
})

// 预算创建验证
export const createBudgetValidator = Joi.object({
    tripId: Joi.string()
        .required()
        .messages({
            'any.required': '行程ID是必填项'
        }),

    totalAmount: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.min': '总预算不能为负数',
            'any.required': '总预算是必填项'
        }),

    currency: Joi.string()
        .valid(...Object.values(CURRENCY_CODES))
        .default(CURRENCY_CODES.CNY)
        .messages({
            'any.only': '请选择有效的货币代码'
        }),

    categories: Joi.array()
        .items(Joi.object({
            category: Joi.string()
                .valid(...Object.values(BUDGET_TYPES))
                .required(),
            allocated: Joi.number()
                .min(0)
                .required()
        }))
        .optional()
        .default([])
})

// 费用记录验证
export const createExpenseValidator = Joi.object({
    tripId: Joi.string()
        .required()
        .messages({
            'any.required': '行程ID是必填项'
        }),

    category: Joi.string()
        .valid(...Object.values(EXPENSE_CATEGORIES))
        .required()
        .messages({
            'any.only': '请选择有效的费用类别',
            'any.required': '费用类别是必填项'
        }),

    amount: Joi.number()
        .min(0.01)
        .required()
        .messages({
            'number.min': '金额必须大于0',
            'any.required': '金额是必填项'
        }),

    currency: Joi.string()
        .valid(...Object.values(CURRENCY_CODES))
        .default(CURRENCY_CODES.CNY),

    description: Joi.string()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.min': '描述不能为空',
            'string.max': '描述长度不能超过200个字符',
            'any.required': '描述是必填项'
        }),

    date: Joi.date()
        .max('now')
        .required()
        .messages({
            'date.max': '费用日期不能超过当前日期',
            'any.required': '费用日期是必填项'
        }),

    location: Joi.string()
        .max(100)
        .optional(),

    tags: Joi.array()
        .items(Joi.string().max(20))
        .max(5)
        .default([])
})

// AI服务请求验证
export const aiRequestValidator = Joi.object({
    prompt: Joi.string()
        .min(1)
        .max(2000)
        .required()
        .messages({
            'string.min': '提示词不能为空',
            'string.max': '提示词长度不能超过2000个字符',
            'any.required': '提示词是必填项'
        }),

    maxTokens: Joi.number()
        .integer()
        .min(1)
        .max(4000)
        .default(1000),

    temperature: Joi.number()
        .min(0)
        .max(2)
        .default(0.7),

    context: Joi.object()
        .optional()
})

// 语音识别请求验证
export const speechRecognitionValidator = Joi.object({
    audio: Joi.alternatives()
        .try(
            Joi.string().base64(),
            Joi.binary()
        )
        .required()
        .messages({
            'any.required': '音频数据是必填项'
        }),

    language: Joi.string()
        .valid('zh-CN', 'en-US', 'ja-JP', 'ko-KR')
        .default('zh-CN'),

    format: Joi.string()
        .valid('wav', 'mp3', 'ogg', 'webm')
        .default('wav')
})

// 分页查询验证
export const paginationValidator = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

    sortBy: Joi.string()
        .optional(),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
})

// 搜索查询验证
export const searchValidator = paginationValidator.keys({
    query: Joi.string()
        .max(100)
        .optional(),

    filters: Joi.object()
        .optional()
})

// 文件上传验证
export const fileUploadValidator = Joi.object({
    fieldname: Joi.string()
        .required(),

    originalname: Joi.string()
        .required(),

    encoding: Joi.string()
        .required(),

    mimetype: Joi.string()
        .required(),

    size: Joi.number()
        .max(10 * 1024 * 1024) // 10MB
        .required()
        .messages({
            'number.max': '文件大小不能超过10MB'
        })
})

// 验证器工具函数
export const validateWithJoi = async (schema: Joi.ObjectSchema, data: any) => {
    try {
        const value = await schema.validateAsync(data, {
            abortEarly: false,
            stripUnknown: true
        })
        return { value, error: null }
    } catch (error) {
        return { value: null, error }
    }
}

// 导出所有验证器
export default {
    registerValidator,
    loginValidator,
    updateUserValidator,
    createTripValidator,
    updateTripValidator,
    createBudgetValidator,
    createExpenseValidator,
    aiRequestValidator,
    speechRecognitionValidator,
    paginationValidator,
    searchValidator,
    fileUploadValidator,
    validateWithJoi
}