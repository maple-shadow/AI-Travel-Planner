import { Request, Response } from 'express'
import { BudgetService } from '../services/budget.service'

export class BudgetController {
    // 创建预算
    static async createBudget(req: Request, res: Response) {
        try {
            const userId = req.user?.id
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: '用户未认证'
                })
            }

            const budgetData = {
                ...req.body,
                user_id: userId
            }

            const result = await BudgetService.createBudget(budgetData)

            if (result.success) {
                return res.status(201).json({
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
            const userId = req.user?.id
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: '用户未认证'
                })
            }

            const expenseData = {
                ...req.body,
                user_id: userId
            }

            const result = await BudgetService.addExpense(expenseData)

            if (result.success) {
                return res.status(201).json({
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
    static async listUserBudgets(req: Request, res: Response) {
        try {
            const { user_id } = req.query
            if (!user_id) {
                return res.status(400).json({ error: '用户ID不能为空' })
            }

            const result = await BudgetService.listUserBudgets(user_id as string)

            if (!result.success) {
                return res.status(400).json({ error: result.error })
            }

            return res.status(200).json(result.data)
        } catch (error) {
            return res.status(500).json({ error: '获取用户预算列表失败' })
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

            const result = await BudgetService.listUserExpenses(userId, options)

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