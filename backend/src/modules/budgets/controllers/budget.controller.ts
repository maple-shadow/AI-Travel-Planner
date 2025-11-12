import { Request, Response } from 'express'
import { BudgetService } from '../services/budget.service'

export class BudgetController {
    // 创建预算
    static async createBudget(req: Request, res: Response) {
        try {
            console.log('=== 预算创建请求开始 ===')
            console.log('请求头:', JSON.stringify(req.headers, null, 2))
            console.log('请求体:', JSON.stringify(req.body, null, 2))

            const userId = req.user?.id
            console.log('认证用户ID:', userId)

            if (!userId) {
                console.log('用户未认证错误')
                return res.status(401).json({
                    success: false,
                    error: '用户未认证'
                })
            }

            // 优先使用认证中间件中的用户ID，如果请求体中已有user_id则使用请求体中的
            const budgetData = {
                ...req.body,
                user_id: req.body.user_id || userId
            }

            console.log('处理后的预算数据:', JSON.stringify(budgetData, null, 2))

            const result = await BudgetService.createBudget(budgetData)
            console.log('BudgetService.createBudget 返回结果:', JSON.stringify(result, null, 2))

            if (result.success) {
                console.log('预算创建成功')
                return res.status(201).json({
                    success: true,
                    data: result.data
                })
            } else {
                if (result.validationErrors && result.validationErrors.length > 0) {
                    console.log('验证错误:', result.validationErrors)
                    return res.status(400).json({
                        success: false,
                        errors: result.validationErrors
                    })
                } else {
                    console.log('业务错误:', result.error)
                    return res.status(400).json({
                        success: false,
                        error: result.error
                    })
                }
            }
        } catch (error) {
            console.error('预算创建异常:', error)
            return res.status(500).json({
                success: false,
                error: '服务器内部错误'
            })
        }
    }

    // 获取预算详情
    static async getBudgetById(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const result = await BudgetService.getBudgetById(id)

            if (!result.success) {
                return res.status(404).json({ error: result.error })
            }

            return res.status(200).json(result.data)
        } catch (error) {
            return res.status(500).json({ error: '获取预算详情失败' })
        }
    }

    // 更新预算
    static async updateBudget(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const updateData = req.body
            const result = await BudgetService.updateBudget(id, updateData)

            if (!result.success) {
                return res.status(400).json({ error: result.error })
            }

            return res.status(200).json(result.data)
        } catch (error) {
            return res.status(500).json({ error: '更新预算失败' })
        }
    }

    // 删除预算
    static async deleteBudget(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const result = await BudgetService.deleteBudget(id)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: '预算删除成功'
                })
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '服务器内部错误'
            })
        }
    }

    // 添加开销
    static async addExpense(req: Request, res: Response) {
        try {
            console.log('=== 开销创建请求开始 ===')
            console.log('请求头:', JSON.stringify(req.headers, null, 2))
            console.log('请求体:', JSON.stringify(req.body, null, 2))

            const userId = req.user?.id
            console.log('认证用户ID:', userId)

            if (!userId) {
                console.log('用户未认证错误')
                return res.status(401).json({
                    success: false,
                    error: '用户未认证'
                })
            }

            // 优先使用认证中间件中的用户ID，如果请求体中已有user_id则使用请求体中的
            const expenseData = {
                ...req.body,
                user_id: req.body.user_id || userId
            }

            console.log('处理后的开销数据:', JSON.stringify(expenseData, null, 2))

            const result = await BudgetService.addExpense(expenseData)
            console.log('BudgetService.addExpense 返回结果:', JSON.stringify(result, null, 2))

            if (result.success) {
                console.log('开销创建成功')
                return res.status(201).json({
                    success: true,
                    data: result.data
                })
            } else {
                if (result.validationErrors && result.validationErrors.length > 0) {
                    console.log('验证错误:', result.validationErrors)
                    return res.status(400).json({
                        success: false,
                        errors: result.validationErrors
                    })
                } else {
                    console.log('业务错误:', result.error)
                    return res.status(400).json({
                        success: false,
                        error: result.error
                    })
                }
            }
        } catch (error) {
            console.error('开销创建异常:', error)
            return res.status(500).json({
                success: false,
                error: '服务器内部错误'
            })
        }
    }

    // 更新开销
    static async updateExpense(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '开销ID不能为空' })
            }

            const result = await BudgetService.updateExpense(id, req.body)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                if (result.validationErrors && result.validationErrors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        errors: result.validationErrors
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        error: result.error
                    })
                }
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '更新开销失败'
            })
        }
    }

    // 删除开销
    static async deleteExpense(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '开销ID不能为空' })
            }

            const result = await BudgetService.deleteExpense(id)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: '开销删除成功'
                })
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '删除开销失败'
            })
        }
    }

    // 获取预算使用情况
    static async getBudgetUsage(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const result = await BudgetService.getBudgetUsage(id)

            if (!result.success) {
                return res.status(404).json({ error: result.error })
            }

            return res.status(200).json(result.data)
        } catch (error) {
            return res.status(500).json({ error: '获取预算使用情况失败' })
        }
    }

    // 获取预算统计信息
    static async getBudgetStats(req: Request, res: Response) {
        try {
            const userId = req.user?.id
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: '用户未认证'
                })
            }

            const result = await BudgetService.getBudgetStats(userId)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '服务器内部错误'
            })
        }
    }

    // 获取开销统计信息
    static async getExpenseStats(req: Request, res: Response) {
        try {
            const { budget_id } = req.query
            if (!budget_id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const result = await BudgetService.getExpenseStats(budget_id as string)

            if (!result.success) {
                return res.status(400).json({ error: result.error })
            }

            return res.status(200).json(result.data)
        } catch (error) {
            return res.status(500).json({ error: '获取开销统计信息失败' })
        }
    }

    // 分析开销趋势
    static async analyzeExpenseTrends(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const { period = 'monthly' } = req.query
            const result = await BudgetService.analyzeExpenseTrends(id, period as 'daily' | 'weekly' | 'monthly')

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '分析开销趋势失败'
            })
        }
    }

    // 生成预算分析报告
    static async generateBudgetReport(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const result = await BudgetService.generateBudgetReport(id)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '生成预算分析报告失败'
            })
        }
    }

    // 列出用户预算
    static async listUserBudgets(req: Request, res: Response): Promise<void> {
        try {
            const { user_id } = req.query

            console.log('🔍 开始获取用户预算列表，查询参数:', JSON.stringify(req.query, null, 2))

            if (!user_id) {
                console.warn('❌ 用户ID不能为空')
                res.status(400).json({
                    success: false,
                    error: '用户ID不能为空'
                })
                return
            }

            console.log(`📋 准备获取用户 ${user_id} 的预算列表`)

            const result = await BudgetService.listUserBudgets(user_id as string, req.query)

            console.log('📊 预算服务返回结果:', JSON.stringify({
                success: result.success,
                dataLength: result.data ? (Array.isArray(result.data) ? result.data.length : '非数组数据') : '无数据',
                error: result.error,
                validationErrors: result.validationErrors
            }, null, 2))

            if (result.success) {
                console.log(`✅ 成功获取用户 ${user_id} 的预算列表，共 ${Array.isArray(result.data) ? result.data.length : 0} 条记录`)
                res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                console.warn(`❌ 获取用户 ${user_id} 的预算列表失败:`, result.error)
                res.status(400).json({
                    success: false,
                    error: result.error,
                    validationErrors: result.validationErrors
                })
            }
        } catch (error) {
            console.error('❌ 获取用户预算列表异常:', error)
            res.status(500).json({
                success: false,
                error: '获取用户预算列表失败'
            })
        }
    }

    // 列出预算开销
    static async listBudgetExpenses(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ error: '预算ID不能为空' })
            }

            const { category, type, limit, offset } = req.query
            const options: any = {}

            if (category) options.category = category
            if (type) options.type = type
            if (limit) options.limit = parseInt(limit as string)
            if (offset) options.offset = parseInt(offset as string)

            const result = await BudgetService.listBudgetExpenses(id, options)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                if (result.validationErrors && result.validationErrors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        errors: result.validationErrors
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        error: result.error
                    })
                }
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '获取预算开销列表失败'
            })
        }
    }

    // 列出用户开销
    static async listUserExpenses(req: Request, res: Response) {
        try {
            const userId = req.user?.id
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: '用户未认证'
                })
            }

            const { budget_id, category, type, date_from, date_to, limit, offset } = req.query
            const options: any = {}

            if (budget_id) options.budget_id = budget_id
            if (category) options.category = category
            if (type) options.type = type
            if (date_from) options.date_from = new Date(date_from as string)
            if (date_to) options.date_to = new Date(date_to as string)
            if (limit) options.limit = parseInt(limit as string)
            if (offset) options.offset = parseInt(offset as string)

            // 优先使用认证中间件中的用户ID，如果查询参数中有user_id则使用查询参数中的
            const targetUserId = req.query.user_id as string || userId
            const result = await BudgetService.listUserExpenses(targetUserId, options)

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                })
            } else {
                if (result.validationErrors && result.validationErrors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        errors: result.validationErrors
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        error: result.error
                    })
                }
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: '服务器内部错误'
            })
        }
    }
}

export default BudgetController