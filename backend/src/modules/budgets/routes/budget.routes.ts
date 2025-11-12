import { Router } from 'express'
import { BudgetController } from '../controllers/budget.controller'
import { authMiddleware } from '../../../core/middleware'

const router = Router()

// 应用认证中间件
router.use(authMiddleware)

// 预算路由
router.post('/', BudgetController.createBudget)
router.get('/', BudgetController.listUserBudgets)
router.get('/stats', BudgetController.getBudgetStats)
router.get('/:id', BudgetController.getBudgetById)
router.put('/:id', BudgetController.updateBudget)
router.delete('/:id', BudgetController.deleteBudget)
router.get('/:id/usage', BudgetController.getBudgetUsage)
router.get('/:id/report', BudgetController.generateBudgetReport)

// 开销路由
router.post('/expenses', BudgetController.addExpense)
router.get('/expenses', BudgetController.listUserExpenses)
router.get('/:id/expenses', BudgetController.listBudgetExpenses)
router.get('/expenses/:id', BudgetController.getExpenseStats)
router.put('/expenses/:id', BudgetController.updateExpense)
router.delete('/expenses/:id', BudgetController.deleteExpense)

// 分析路由
router.get('/:id/trends', BudgetController.analyzeExpenseTrends)
router.get('/:id/expenses/stats', BudgetController.getExpenseStats)

export default router