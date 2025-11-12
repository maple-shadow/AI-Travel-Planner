import { CreateBudgetData, UpdateBudgetData, CreateExpenseData, UpdateExpenseData, BudgetValidationError } from '../types/budget.types'

export class BudgetValidators {
    // 验证预算创建数据
    static validateCreateBudget(data: CreateBudgetData): BudgetValidationError[] {
        console.log('=== BudgetValidators.validateCreateBudget 开始 ===')
        console.log('验证数据:', JSON.stringify(data, null, 2))

        const errors: BudgetValidationError[] = []

        // 验证行程ID
        if (!data.trip_id || data.trip_id.trim() === '') {
            console.log('验证失败: 行程ID为空')
            errors.push({
                field: 'trip_id',
                message: '行程ID不能为空',
                code: 'TRIP_ID_REQUIRED'
            })
        } else {
            console.log('行程ID验证通过:', data.trip_id)
        }

        // 验证用户ID
        if (!data.user_id || data.user_id.trim() === '') {
            console.log('验证失败: 用户ID为空')
            errors.push({
                field: 'user_id',
                message: '用户ID不能为空',
                code: 'USER_ID_REQUIRED'
            })
        } else {
            console.log('用户ID验证通过:', data.user_id)
        }

        // 验证总金额
        if (data.total_amount === undefined || data.total_amount === null) {
            console.log('验证失败: 总金额为空')
            errors.push({
                field: 'total_amount',
                message: '总金额不能为空',
                code: 'TOTAL_AMOUNT_REQUIRED'
            })
        } else if (data.total_amount <= 0) {
            console.log('验证失败: 总金额小于等于0:', data.total_amount)
            errors.push({
                field: 'total_amount',
                message: '总金额必须大于0',
                code: 'TOTAL_AMOUNT_INVALID'
            })
        } else if (data.total_amount > 1000000) {
            console.log('验证失败: 总金额超过限制:', data.total_amount)
            errors.push({
                field: 'total_amount',
                message: '总金额不能超过1,000,000',
                code: 'TOTAL_AMOUNT_TOO_LARGE'
            })
        } else {
            console.log('总金额验证通过:', data.total_amount)
        }

        // 验证开始日期
        if (!data.start_date) {
            console.log('验证失败: 开始日期为空')
            errors.push({
                field: 'start_date',
                message: '开始日期不能为空',
                code: 'START_DATE_REQUIRED'
            })
        } else if (new Date(data.start_date) < new Date()) {
            console.log('验证失败: 开始日期早于当前日期:', data.start_date)
            errors.push({
                field: 'start_date',
                message: '开始日期不能早于当前日期',
                code: 'START_DATE_INVALID'
            })
        } else {
            console.log('开始日期验证通过:', data.start_date)
        }

        // 验证结束日期
        if (!data.end_date) {
            console.log('验证失败: 结束日期为空')
            errors.push({
                field: 'end_date',
                message: '结束日期不能为空',
                code: 'END_DATE_REQUIRED'
            })
        } else if (new Date(data.end_date) <= new Date(data.start_date)) {
            console.log('验证失败: 结束日期不晚于开始日期:', data.end_date)
            errors.push({
                field: 'end_date',
                message: '结束日期必须晚于开始日期',
                code: 'END_DATE_INVALID'
            })
        } else {
            console.log('结束日期验证通过:', data.end_date)
        }

        // 验证货币
        if (data.currency && data.currency.length !== 3) {
            console.log('验证失败: 货币代码长度不为3:', data.currency)
            errors.push({
                field: 'currency',
                message: '货币代码必须是3个字符',
                code: 'CURRENCY_INVALID'
            })
        } else if (data.currency) {
            console.log('货币代码验证通过:', data.currency)
        }

        // 验证备注长度
        if (data.notes && data.notes.length > 500) {
            console.log('验证失败: 备注超过500字符:', data.notes.length)
            errors.push({
                field: 'notes',
                message: '备注不能超过500个字符',
                code: 'NOTES_TOO_LONG'
            })
        } else if (data.notes) {
            console.log('备注验证通过:', data.notes.length, '字符')
        }

        console.log('验证完成 - 错误数量:', errors.length)
        if (errors.length > 0) {
            console.log('验证错误详情:', errors)
        } else {
            console.log('所有验证通过')
        }

        return errors
    }

    // 验证预算更新数据
    static validateUpdateBudget(data: UpdateBudgetData): BudgetValidationError[] {
        const errors: BudgetValidationError[] = []

        // 验证总金额
        if (data.total_amount !== undefined) {
            if (data.total_amount <= 0) {
                errors.push({
                    field: 'total_amount',
                    message: '总金额必须大于0',
                    code: 'TOTAL_AMOUNT_INVALID'
                })
            } else if (data.total_amount > 1000000) {
                errors.push({
                    field: 'total_amount',
                    message: '总金额不能超过1,000,000',
                    code: 'TOTAL_AMOUNT_TOO_LARGE'
                })
            }
        }

        // 验证开始日期
        if (data.start_date && new Date(data.start_date) < new Date()) {
            errors.push({
                field: 'start_date',
                message: '开始日期不能早于当前日期',
                code: 'START_DATE_INVALID'
            })
        }

        // 验证结束日期
        if (data.end_date && data.start_date && new Date(data.end_date) <= new Date(data.start_date)) {
            errors.push({
                field: 'end_date',
                message: '结束日期必须晚于开始日期',
                code: 'END_DATE_INVALID'
            })
        }

        // 验证货币
        if (data.currency && data.currency.length !== 3) {
            errors.push({
                field: 'currency',
                message: '货币代码必须是3个字符',
                code: 'CURRENCY_INVALID'
            })
        }

        // 验证备注长度
        if (data.notes && data.notes.length > 500) {
            errors.push({
                field: 'notes',
                message: '备注不能超过500个字符',
                code: 'NOTES_TOO_LONG'
            })
        }

        return errors
    }

    // 验证开销创建数据
    static validateCreateExpense(data: CreateExpenseData): BudgetValidationError[] {
        const errors: BudgetValidationError[] = []

        // 验证预算ID
        if (!data.budget_id || data.budget_id.trim() === '') {
            errors.push({
                field: 'budget_id',
                message: '预算ID不能为空',
                code: 'BUDGET_ID_REQUIRED'
            })
        }

        // 验证用户ID
        if (!data.user_id || data.user_id.trim() === '') {
            errors.push({
                field: 'user_id',
                message: '用户ID不能为空',
                code: 'USER_ID_REQUIRED'
            })
        }

        // 验证金额
        if (data.amount === undefined || data.amount === null) {
            errors.push({
                field: 'amount',
                message: '金额不能为空',
                code: 'AMOUNT_REQUIRED'
            })
        } else if (data.amount <= 0) {
            errors.push({
                field: 'amount',
                message: '金额必须大于0',
                code: 'AMOUNT_INVALID'
            })
        } else if (data.amount > 100000) {
            errors.push({
                field: 'amount',
                message: '金额不能超过100,000',
                code: 'AMOUNT_TOO_LARGE'
            })
        }

        // 验证分类
        if (!data.category) {
            errors.push({
                field: 'category',
                message: '分类不能为空',
                code: 'CATEGORY_REQUIRED'
            })
        }

        // 验证描述
        if (!data.description || data.description.trim() === '') {
            errors.push({
                field: 'description',
                message: '描述不能为空',
                code: 'DESCRIPTION_REQUIRED'
            })
        } else if (data.description.length > 200) {
            errors.push({
                field: 'description',
                message: '描述不能超过200个字符',
                code: 'DESCRIPTION_TOO_LONG'
            })
        }

        // 验证日期
        if (!data.expense_date) {
            errors.push({
                field: 'expense_date',
                message: '日期不能为空',
                code: 'DATE_REQUIRED'
            })
        } else if (new Date(data.expense_date) > new Date()) {
            errors.push({
                field: 'expense_date',
                message: '日期不能晚于当前日期',
                code: 'DATE_INVALID'
            })
        }

        // 验证货币
        if (data.currency && data.currency.length !== 3) {
            errors.push({
                field: 'currency',
                message: '货币代码必须是3个字符',
                code: 'CURRENCY_INVALID'
            })
        }

        // 验证位置长度
        if (data.location && data.location.length > 100) {
            errors.push({
                field: 'location',
                message: '位置不能超过100个字符',
                code: 'LOCATION_TOO_LONG'
            })
        }

        // 验证标签
        if (data.tags && data.tags.length > 10) {
            errors.push({
                field: 'tags',
                message: '标签数量不能超过10个',
                code: 'TAGS_TOO_MANY'
            })
        }

        if (data.tags) {
            data.tags.forEach((tag, index) => {
                if (tag.length > 20) {
                    errors.push({
                        field: `tags[${index}]`,
                        message: '单个标签不能超过20个字符',
                        code: 'TAG_TOO_LONG'
                    })
                }
            })
        }

        return errors
    }

    // 验证开销更新数据
    static validateUpdateExpense(data: UpdateExpenseData): BudgetValidationError[] {
        const errors: BudgetValidationError[] = []

        // 验证金额
        if (data.amount !== undefined) {
            if (data.amount <= 0) {
                errors.push({
                    field: 'amount',
                    message: '金额必须大于0',
                    code: 'AMOUNT_INVALID'
                })
            } else if (data.amount > 100000) {
                errors.push({
                    field: 'amount',
                    message: '金额不能超过100,000',
                    code: 'AMOUNT_TOO_LARGE'
                })
            }
        }

        // 验证描述长度
        if (data.description && data.description.length > 200) {
            errors.push({
                field: 'description',
                message: '描述不能超过200个字符',
                code: 'DESCRIPTION_TOO_LONG'
            })
        }

        // 验证日期
        if (data.expense_date && new Date(data.expense_date) > new Date()) {
            errors.push({
                field: 'expense_date',
                message: '日期不能晚于当前日期',
                code: 'DATE_INVALID'
            })
        }

        // 验证货币
        if (data.currency && data.currency.length !== 3) {
            errors.push({
                field: 'currency',
                message: '货币代码必须是3个字符',
                code: 'CURRENCY_INVALID'
            })
        }

        // 验证位置长度
        if (data.location && data.location.length > 100) {
            errors.push({
                field: 'location',
                message: '位置不能超过100个字符',
                code: 'LOCATION_TOO_LONG'
            })
        }

        // 验证标签
        if (data.tags && data.tags.length > 10) {
            errors.push({
                field: 'tags',
                message: '标签数量不能超过10个',
                code: 'TAGS_TOO_MANY'
            })
        }

        if (data.tags) {
            data.tags.forEach((tag, index) => {
                if (tag.length > 20) {
                    errors.push({
                        field: `tags[${index}]`,
                        message: '单个标签不能超过20个字符',
                        code: 'TAG_TOO_LONG'
                    })
                }
            })
        }

        return errors
    }

    // 验证预算查询参数
    static validateBudgetQuery(options: any): BudgetValidationError[] {
        const errors: BudgetValidationError[] = []

        // 验证限制数量
        if (options.limit !== undefined && (options.limit < 1 || options.limit > 100)) {
            errors.push({
                field: 'limit',
                message: '限制数量必须在1到100之间',
                code: 'LIMIT_INVALID'
            })
        }

        // 验证偏移量
        if (options.offset !== undefined && options.offset < 0) {
            errors.push({
                field: 'offset',
                message: '偏移量不能为负数',
                code: 'OFFSET_INVALID'
            })
        }

        // 验证金额范围
        if (options.min_amount !== undefined && options.min_amount < 0) {
            errors.push({
                field: 'min_amount',
                message: '最小金额不能为负数',
                code: 'MIN_AMOUNT_INVALID'
            })
        }

        if (options.max_amount !== undefined && options.max_amount < 0) {
            errors.push({
                field: 'max_amount',
                message: '最大金额不能为负数',
                code: 'MAX_AMOUNT_INVALID'
            })
        }

        if (options.min_amount !== undefined && options.max_amount !== undefined && options.min_amount > options.max_amount) {
            errors.push({
                field: 'min_amount',
                message: '最小金额不能大于最大金额',
                code: 'AMOUNT_RANGE_INVALID'
            })
        }

        return errors
    }

    // 验证开销查询参数
    static validateExpenseQuery(options: any): BudgetValidationError[] {
        const errors: BudgetValidationError[] = []

        // 验证限制数量
        if (options.limit !== undefined && (options.limit < 1 || options.limit > 100)) {
            errors.push({
                field: 'limit',
                message: '限制数量必须在1到100之间',
                code: 'LIMIT_INVALID'
            })
        }

        // 验证偏移量
        if (options.offset !== undefined && options.offset < 0) {
            errors.push({
                field: 'offset',
                message: '偏移量不能为负数',
                code: 'OFFSET_INVALID'
            })
        }

        // 验证金额范围
        if (options.min_amount !== undefined && options.min_amount < 0) {
            errors.push({
                field: 'min_amount',
                message: '最小金额不能为负数',
                code: 'MIN_AMOUNT_INVALID'
            })
        }

        if (options.max_amount !== undefined && options.max_amount < 0) {
            errors.push({
                field: 'max_amount',
                message: '最大金额不能为负数',
                code: 'MAX_AMOUNT_INVALID'
            })
        }

        if (options.min_amount !== undefined && options.max_amount !== undefined && options.min_amount > options.max_amount) {
            errors.push({
                field: 'min_amount',
                message: '最小金额不能大于最大金额',
                code: 'AMOUNT_RANGE_INVALID'
            })
        }

        return errors
    }
}

export default BudgetValidators