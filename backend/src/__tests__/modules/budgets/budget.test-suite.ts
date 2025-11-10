/**
 * 单元测试模块 - 预算管理模块测试套件
 * 模块15：单元测试模块
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { BudgetService } from '../../../modules/budgets/services/budget.service';
import { BudgetModel } from '../../../modules/budgets/models/budget.model';
import { ExpenseModel } from '../../../modules/budgets/models/expense.model';
import { BudgetValidators } from '../../../modules/budgets/validators/budget.validators';

/**
 * 预算管理模块测试套件
 */
export class BudgetTestSuite {
    private budgetService: BudgetService;
    private budgetModel: BudgetModel;
    private expenseModel: ExpenseModel;
    private validators: BudgetValidators;

    constructor() {
        this.budgetService = new BudgetService();
        this.budgetModel = new BudgetModel();
        this.expenseModel = new ExpenseModel();
        this.validators = new BudgetValidators();
    }

    /**
     * 测试预算创建功能
     */
    testBudgetCreation() {
        describe('预算创建功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功创建预算', async () => {
                const budgetData = {
                    title: '旅行预算',
                    amount: 5000,
                    category: 'TRAVEL',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31'),
                    userId: 'user123'
                };

                const result = await this.budgetService.createBudget(budgetData);

                expect(result.success).toBe(true);
                expect(result.budget).toBeDefined();
                expect(result.budget.title).toBe(budgetData.title);
                expect(result.budget.amount).toBe(budgetData.amount);
            });

            it('应该验证预算金额有效性', async () => {
                const invalidBudgetData = {
                    title: '无效预算',
                    amount: -100, // 无效金额
                    category: 'TRAVEL',
                    userId: 'user123'
                };

                await expect(this.budgetService.createBudget(invalidBudgetData)).rejects.toThrow('预算金额无效');
            });

            it('应该验证预算日期范围', async () => {
                const invalidDateBudget = {
                    title: '无效日期预算',
                    amount: 1000,
                    category: 'TRAVEL',
                    startDate: new Date('2024-12-31'),
                    endDate: new Date('2024-01-01'), // 结束日期早于开始日期
                    userId: 'user123'
                };

                await expect(this.budgetService.createBudget(invalidDateBudget)).rejects.toThrow('日期范围无效');
            });
        });
    }

    /**
     * 测试预算查询功能
     */
    testBudgetQuery() {
        describe('预算查询功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该根据ID查询预算', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.getBudgetById(budgetId);

                expect(result).toBeDefined();
                expect(result.id).toBe(budgetId);
            });

            it('应该查询用户的所有预算', async () => {
                const userId = 'user123';

                const result = await this.budgetService.getUserBudgets(userId);

                expect(Array.isArray(result)).toBe(true);
                expect(result.length).toBeGreaterThanOrEqual(0);
            });

            it('应该根据分类查询预算', async () => {
                const userId = 'user123';
                const category = 'TRAVEL';

                const result = await this.budgetService.getBudgetsByCategory(userId, category);

                expect(Array.isArray(result)).toBe(true);
                result.forEach(budget => {
                    expect(budget.category).toBe(category);
                });
            });

            it('应该返回空的预算列表当用户无预算时', async () => {
                const userId = 'nonexistent-user';

                const result = await this.budgetService.getUserBudgets(userId);

                expect(Array.isArray(result)).toBe(true);
                expect(result.length).toBe(0);
            });
        });
    }

    /**
     * 测试预算更新功能
     */
    testBudgetUpdate() {
        describe('预算更新功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功更新预算', async () => {
                const budgetId = 'budget123';
                const updateData = {
                    title: '更新后的旅行预算',
                    amount: 6000
                };

                const result = await this.budgetService.updateBudget(budgetId, updateData);

                expect(result.success).toBe(true);
                expect(result.budget).toBeDefined();
                expect(result.budget.title).toBe(updateData.title);
                expect(result.budget.amount).toBe(updateData.amount);
            });

            it('应该拒绝更新不存在的预算', async () => {
                const budgetId = 'nonexistent-budget';
                const updateData = { title: '新标题' };

                await expect(this.budgetService.updateBudget(budgetId, updateData)).rejects.toThrow('预算不存在');
            });

            it('应该验证更新数据的有效性', async () => {
                const budgetId = 'budget123';
                const invalidUpdateData = { amount: -100 };

                await expect(this.budgetService.updateBudget(budgetId, invalidUpdateData)).rejects.toThrow('更新数据无效');
            });
        });
    }

    /**
     * 测试预算删除功能
     */
    testBudgetDeletion() {
        describe('预算删除功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功删除预算', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.deleteBudget(budgetId);

                expect(result.success).toBe(true);
                expect(result.message).toContain('删除成功');
            });

            it('应该同时删除关联的开销记录', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.deleteBudget(budgetId);

                expect(result.success).toBe(true);
                // 验证关联开销也被删除
                const expenses = await this.expenseModel.getExpensesByBudget(budgetId);
                expect(expenses.length).toBe(0);
            });

            it('应该拒绝删除不存在的预算', async () => {
                const budgetId = 'nonexistent-budget';

                await expect(this.budgetService.deleteBudget(budgetId)).rejects.toThrow('预算不存在');
            });
        });
    }

    /**
     * 测试开销管理功能
     */
    testExpenseManagement() {
        describe('开销管理功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该成功添加开销', async () => {
                const expenseData = {
                    budgetId: 'budget123',
                    amount: 100,
                    description: '交通费用',
                    category: 'TRANSPORTATION',
                    date: new Date()
                };

                const result = await this.budgetService.addExpense(expenseData);

                expect(result.success).toBe(true);
                expect(result.expense).toBeDefined();
                expect(result.expense.amount).toBe(expenseData.amount);
            });

            it('应该验证开销金额不超过预算', async () => {
                const expenseData = {
                    budgetId: 'budget123',
                    amount: 10000, // 超过预算金额
                    description: '大额开销',
                    category: 'OTHER'
                };

                await expect(this.budgetService.addExpense(expenseData)).rejects.toThrow('开销金额超过预算');
            });

            it('应该查询预算的所有开销', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.getBudgetExpenses(budgetId);

                expect(Array.isArray(result)).toBe(true);
            });

            it('应该删除开销记录', async () => {
                const expenseId = 'expense123';

                const result = await this.budgetService.deleteExpense(expenseId);

                expect(result.success).toBe(true);
            });
        });
    }

    /**
     * 测试预算分析功能
     */
    testBudgetAnalysis() {
        describe('预算分析功能测试', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('应该生成预算分析报告', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.generateBudgetAnalysis(budgetId);

                expect(result).toBeDefined();
                expect(result.totalBudget).toBeDefined();
                expect(result.totalExpenses).toBeDefined();
                expect(result.remainingAmount).toBeDefined();
                expect(result.usagePercentage).toBeDefined();
            });

            it('应该计算预算使用率', async () => {
                const budgetId = 'budget123';

                const analysis = await this.budgetService.generateBudgetAnalysis(budgetId);

                expect(analysis.usagePercentage).toBeGreaterThanOrEqual(0);
                expect(analysis.usagePercentage).toBeLessThanOrEqual(100);
            });

            it('应该按分类统计开销', async () => {
                const budgetId = 'budget123';

                const result = await this.budgetService.getExpenseByCategory(budgetId);

                expect(typeof result).toBe('object');
                Object.values(result).forEach(amount => {
                    expect(typeof amount).toBe('number');
                    expect(amount).toBeGreaterThanOrEqual(0);
                });
            });
        });
    }

    /**
     * 测试验证器功能
     */
    testValidators() {
        describe('验证器功能测试', () => {
            it('应该验证预算金额格式', () => {
                const validAmounts = [100, 1000.50, 0.01];
                const invalidAmounts = [-100, 0, -0.01];

                validAmounts.forEach(amount => {
                    expect(this.validators.validateAmount(amount)).toBe(true);
                });

                invalidAmounts.forEach(amount => {
                    expect(this.validators.validateAmount(amount)).toBe(false);
                });
            });

            it('应该验证预算分类', () => {
                const validCategories = ['TRAVEL', 'FOOD', 'TRANSPORTATION', 'ACCOMMODATION', 'ENTERTAINMENT'];
                const invalidCategories = ['INVALID', '', null];

                validCategories.forEach(category => {
                    expect(this.validators.validateCategory(category)).toBe(true);
                });

                invalidCategories.forEach(category => {
                    expect(this.validators.validateCategory(category)).toBe(false);
                });
            });

            it('应该验证日期范围', () => {
                const validRange = {
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31')
                };

                const invalidRange = {
                    startDate: new Date('2024-12-31'),
                    endDate: new Date('2024-01-01')
                };

                expect(this.validators.validateDateRange(validRange.startDate, validRange.endDate)).toBe(true);
                expect(this.validators.validateDateRange(invalidRange.startDate, invalidRange.endDate)).toBe(false);
            });
        });
    }

    /**
     * 运行所有预算管理模块测试
     */
    runAllTests() {
        describe('预算管理模块 - 完整测试套件', () => {
            this.testBudgetCreation();
            this.testBudgetQuery();
            this.testBudgetUpdate();
            this.testBudgetDeletion();
            this.testExpenseManagement();
            this.testBudgetAnalysis();
            this.testValidators();
        });
    }
}

/**
 * 创建预算管理测试套件实例
 */
export const createBudgetTestSuite = () => {
    return new BudgetTestSuite();
};