import { Router } from 'express'
import { BudgetController } from '../controllers/budget.controller'
import { authMiddleware } from '../../../core/middleware'

const router = Router()

// 应用认证中间件
router.use(authMiddleware)

// 预算路由
router.post('/budgets', BudgetController.createBudget)
router.get('/budgets', BudgetController.listUserBudgets)
router.get('/budgets/stats', BudgetController.getBudgetStats)
router.get('/budgets/:id', BudgetController.getBudgetById)
router.put('/budgets/:id', BudgetController.updateBudget)
router.delete('/budgets/:id', BudgetController.deleteBudget)
router.get('/budgets/:id/usage', BudgetController.getBudgetUsage)
router.get('/budgets/:id/report', BudgetController.generateBudgetReport)

// 开销路由
router.post('/expenses', BudgetController.addExpense)
router.get('/expenses', BudgetController.listUserExpenses)
router.get('/budgets/:id/expenses', BudgetController.listBudgetExpenses)
router.get('/expenses/:id', BudgetController.getExpenseStats)
router.put('/expenses/:id', BudgetController.updateExpense)
router.delete('/expenses/:id', BudgetController.deleteExpense)

// 分析路由
router.get('/budgets/:id/trends', BudgetController.analyzeExpenseTrends)
router.get('/budgets/:id/expenses/stats', BudgetController.getExpenseStats)

export default router