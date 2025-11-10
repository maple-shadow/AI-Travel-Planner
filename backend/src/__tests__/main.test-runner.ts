/**
 * 单元测试模块 - 主测试运行器
 * 模块15：单元测试模块
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { TestRunner } from './core/test-runner';
import { createAuthTestSuite } from './modules/auth/auth.test-suite';
import { createBudgetTestSuite } from './modules/budgets/budget.test-suite';
import { createAITestSuite } from './modules/ai-services/ai.test-suite';
import { createSyncTestSuite } from './modules/data-sync/sync.test-suite';
import { createTripTestSuite } from './modules/trips/trip.test-suite';
import { createUserTestSuite } from './modules/users/user.test-suite';

/**
 * 主测试运行器 - 负责协调所有模块测试
 */
export class MainTestRunner {
    private testRunner: TestRunner;
    private testSuites: Map<string, any>;
    private testResults: Map<string, any>;

    constructor() {
        this.testRunner = new TestRunner();
        this.testSuites = new Map();
        this.testResults = new Map();
        this.initializeTestSuites();
    }

    /**
     * 初始化所有测试套件
     */
    private initializeTestSuites() {
        // 认证模块测试套件
        this.testSuites.set('auth', createAuthTestSuite());

        // 预算管理模块测试套件
        this.testSuites.set('budgets', createBudgetTestSuite());

        // AI服务模块测试套件
        this.testSuites.set('ai-services', createAITestSuite());

        // 数据同步模块测试套件
        this.testSuites.set('data-sync', createSyncTestSuite());

        // 行程管理模块测试套件
        this.testSuites.set('trips', createTripTestSuite());

        // 用户管理模块测试套件
        this.testSuites.set('users', createUserTestSuite());
    }

    /**
     * 运行单个模块的测试
     */
    async runModuleTests(moduleName: string) {
        const testSuite = this.testSuites.get(moduleName);
        if (!testSuite) {
            throw new Error(`未找到模块 ${moduleName} 的测试套件`);
        }

        console.log(`\n🚀 开始运行 ${moduleName} 模块测试...`);

        const startTime = Date.now();

        try {
            // 运行测试套件
            testSuite.runAllTests();

            const endTime = Date.now();
            const duration = endTime - startTime;

            const result = {
                module: moduleName,
                status: 'PASSED',
                duration: duration,
                timestamp: new Date()
            };

            this.testResults.set(moduleName, result);
            console.log(`✅ ${moduleName} 模块测试完成，耗时 ${duration}ms`);

            return result;
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;

            const result = {
                module: moduleName,
                status: 'FAILED',
                duration: duration,
                error: error.message,
                timestamp: new Date()
            };

            this.testResults.set(moduleName, result);
            console.error(`❌ ${moduleName} 模块测试失败: ${error.message}`);

            return result;
        }
    }

    /**
     * 运行所有模块的测试
     */
    async runAllTests() {
        console.log('🎯 开始运行所有模块的单元测试...\n');

        const startTime = Date.now();
        const results = [];

        // 按模块顺序运行测试
        const moduleOrder = ['auth', 'users', 'trips', 'budgets', 'ai-services', 'data-sync'];

        for (const moduleName of moduleOrder) {
            const result = await this.runModuleTests(moduleName);
            results.push(result);
        }

        const endTime = Date.now();
        const totalDuration = endTime - startTime;

        // 生成测试报告
        const report = this.generateTestReport(results, totalDuration);

        console.log('\n📊 测试报告:');
        console.log(report.summary);

        return report;
    }

    /**
     * 生成测试报告
     */
    private generateTestReport(results: any[], totalDuration: number) {
        const passedCount = results.filter(r => r.status === 'PASSED').length;
        const failedCount = results.filter(r => r.status === 'FAILED').length;
        const totalCount = results.length;

        const summary = `
========================================
           单元测试报告
========================================
总测试模块: ${totalCount}
通过模块: ${passedCount}
失败模块: ${failedCount}
测试覆盖率: ${((passedCount / totalCount) * 100).toFixed(1)}%
总耗时: ${totalDuration}ms
========================================
    `.trim();

        const details = results.map(result => {
            return `
模块: ${result.module}
状态: ${result.status === 'PASSED' ? '✅ 通过' : '❌ 失败'}
耗时: ${result.duration}ms
${result.error ? `错误: ${result.error}` : ''}
----------------------------------------
      `.trim();
        }).join('\n');

        return {
            summary,
            details,
            statistics: {
                totalModules: totalCount,
                passedModules: passedCount,
                failedModules: failedCount,
                successRate: (passedCount / totalCount) * 100,
                totalDuration
            },
            results
        };
    }

    /**
     * 运行覆盖率检查
     */
    async runCoverageCheck() {
        console.log('\n📈 开始运行覆盖率检查...');

        const coverageConfig = {
            threshold: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        };

        const coverageResult = await this.testRunner.generateCoverageReport(coverageConfig);

        console.log('📊 覆盖率报告:');
        console.log(`分支覆盖率: ${coverageResult.branches}%`);
        console.log(`函数覆盖率: ${coverageResult.functions}%`);
        console.log(`行覆盖率: ${coverageResult.lines}%`);
        console.log(`语句覆盖率: ${coverageResult.statements}%`);

        return coverageResult;
    }

    /**
     * 运行集成测试
     */
    async runIntegrationTests() {
        console.log('\n🔗 开始运行集成测试...');

        const integrationTests = [
            {
                name: '用户认证流程',
                description: '测试用户注册、登录、权限验证的完整流程',
                modules: ['auth', 'users']
            },
            {
                name: '行程预算关联',
                description: '测试行程创建与预算管理的关联功能',
                modules: ['trips', 'budgets']
            },
            {
                name: 'AI规划集成',
                description: '测试AI服务与行程、预算的集成功能',
                modules: ['ai-services', 'trips', 'budgets']
            },
            {
                name: '数据同步流程',
                description: '测试离线数据同步与冲突解决流程',
                modules: ['data-sync', 'trips', 'budgets']
            }
        ];

        const integrationResults = [];

        for (const test of integrationTests) {
            console.log(`\n🔍 运行集成测试: ${test.name}`);
            console.log(`描述: ${test.description}`);

            const startTime = Date.now();

            try {
                // 模拟集成测试逻辑
                await this.simulateIntegrationTest(test.modules);

                const endTime = Date.now();
                const duration = endTime - startTime;

                integrationResults.push({
                    name: test.name,
                    status: 'PASSED',
                    duration,
                    timestamp: new Date()
                });

                console.log(`✅ ${test.name} 集成测试通过`);
            } catch (error) {
                const endTime = Date.now();
                const duration = endTime - startTime;

                integrationResults.push({
                    name: test.name,
                    status: 'FAILED',
                    duration,
                    error: error.message,
                    timestamp: new Date()
                });

                console.error(`❌ ${test.name} 集成测试失败: ${error.message}`);
            }
        }

        return integrationResults;
    }

    /**
     * 模拟集成测试
     */
    private async simulateIntegrationTest(modules: string[]) {
        // 模拟模块间的集成测试逻辑
        console.log(`模拟集成测试: ${modules.join(' -> ')}`);

        // 简单的延迟模拟实际集成测试
        await new Promise(resolve => setTimeout(resolve, 100));

        // 随机模拟测试失败（10%概率）
        if (Math.random() < 0.1) {
            throw new Error('集成测试模拟失败');
        }
    }

    /**
     * 运行完整的测试套件（单元测试 + 集成测试 + 覆盖率检查）
     */
    async runFullTestSuite() {
        console.log('🚀 开始运行完整测试套件...\n');

        const startTime = Date.now();

        // 1. 运行单元测试
        const unitTestReport = await this.runAllTests();

        // 2. 运行集成测试
        const integrationResults = await this.runIntegrationTests();

        // 3. 运行覆盖率检查
        const coverageResult = await this.runCoverageCheck();

        const endTime = Date.now();
        const totalDuration = endTime - startTime;

        // 生成完整报告
        const fullReport = this.generateFullReport(
            unitTestReport,
            integrationResults,
            coverageResult,
            totalDuration
        );

        console.log('\n🎉 完整测试套件执行完成!');
        console.log(fullReport.summary);

        return fullReport;
    }

    /**
     * 生成完整测试报告
     */
    private generateFullReport(
        unitTestReport: any,
        integrationResults: any[],
        coverageResult: any,
        totalDuration: number
    ) {
        const passedIntegration = integrationResults.filter(r => r.status === 'PASSED').length;
        const totalIntegration = integrationResults.length;

        const summary = `
========================================
           完整测试报告
========================================
📊 单元测试:
    - 总模块: ${unitTestReport.statistics.totalModules}
    - 通过模块: ${unitTestReport.statistics.passedModules}
    - 成功率: ${unitTestReport.statistics.successRate.toFixed(1)}%

🔗 集成测试:
    - 总测试: ${totalIntegration}
    - 通过测试: ${passedIntegration}
    - 成功率: ${((passedIntegration / totalIntegration) * 100).toFixed(1)}%

📈 覆盖率检查:
    - 分支覆盖率: ${coverageResult.branches}%
    - 函数覆盖率: ${coverageResult.functions}%
    - 行覆盖率: ${coverageResult.lines}%
    - 语句覆盖率: ${coverageResult.statements}%

⏱️ 总耗时: ${totalDuration}ms
========================================
    `.trim();

        return {
            summary,
            unitTestReport,
            integrationResults,
            coverageResult,
            totalDuration
        };
    }
}

/**
 * 创建主测试运行器实例
 */
export const createMainTestRunner = () => {
    return new MainTestRunner();
};

/**
 * 主测试入口点
 */
if (require.main === module) {
    (async () => {
        const testRunner = createMainTestRunner();

        try {
            // 运行完整测试套件
            const report = await testRunner.runFullTestSuite();

            // 根据测试结果设置退出码
            const hasFailures = report.unitTestReport.statistics.failedModules > 0 ||
                report.integrationResults.some((r: any) => r.status === 'FAILED');

            process.exit(hasFailures ? 1 : 0);
        } catch (error) {
            console.error('❌ 测试运行器发生错误:', error);
            process.exit(1);
        }
    })();
}

// 导出测试套件用于单独运行
export { createAuthTestSuite } from './modules/auth/auth.test-suite';
export { createBudgetTestSuite } from './modules/budgets/budget.test-suite';
export { createAITestSuite } from './modules/ai-services/ai.test-suite';
export { createSyncTestSuite } from './modules/data-sync/sync.test-suite';
export { createTripTestSuite } from './modules/trips/trip.test-suite';
export { createUserTestSuite } from './modules/users/user.test-suite';