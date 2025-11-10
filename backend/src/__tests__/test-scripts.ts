/**
 * 单元测试模块 - 测试脚本工具
 * 模块15：单元测试模块
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createMainTestRunner } from './main.test-runner';

const execAsync = promisify(exec);

/**
 * 测试脚本工具类
 */
export class TestScripts {
    private testRunner: any;

    constructor() {
        this.testRunner = createMainTestRunner();
    }

    /**
     * 运行单元测试
     */
    async runUnitTests() {
        console.log('🚀 开始运行单元测试...\n');

        try {
            const report = await this.testRunner.runAllTests();
            return report;
        } catch (error) {
            console.error('❌ 单元测试运行失败:', error);
            throw error;
        }
    }

    /**
     * 运行集成测试
     */
    async runIntegrationTests() {
        console.log('🔗 开始运行集成测试...\n');

        try {
            const results = await this.testRunner.runIntegrationTests();
            return results;
        } catch (error) {
            console.error('❌ 集成测试运行失败:', error);
            throw error;
        }
    }

    /**
     * 运行覆盖率检查
     */
    async runCoverageCheck() {
        console.log('📈 开始运行覆盖率检查...\n');

        try {
            const coverage = await this.testRunner.runCoverageCheck();
            return coverage;
        } catch (error) {
            console.error('❌ 覆盖率检查失败:', error);
            throw error;
        }
    }

    /**
     * 运行完整测试套件
     */
    async runFullTestSuite() {
        console.log('🎯 开始运行完整测试套件...\n');

        try {
            const report = await this.testRunner.runFullTestSuite();
            return report;
        } catch (error) {
            console.error('❌ 完整测试套件运行失败:', error);
            throw error;
        }
    }

    /**
     * 运行特定模块的测试
     */
    async runModuleTests(moduleName: string) {
        console.log(`🎯 开始运行 ${moduleName} 模块测试...\n`);

        try {
            const result = await this.testRunner.runModuleTests(moduleName);
            return result;
        } catch (error) {
            console.error(`❌ ${moduleName} 模块测试运行失败:`, error);
            throw error;
        }
    }

    /**
     * 使用Jest CLI运行测试
     */
    async runJestTests(options: string = '') {
        console.log('🔧 使用Jest CLI运行测试...\n');

        const command = `npx jest ${options}`;

        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: process.cwd()
            });

            console.log('Jest输出:');
            console.log(stdout);

            if (stderr) {
                console.error('Jest错误:');
                console.error(stderr);
            }

            return { stdout, stderr };
        } catch (error) {
            console.error('❌ Jest测试运行失败:', error);
            throw error;
        }
    }

    /**
     * 运行测试并生成覆盖率报告
     */
    async runTestsWithCoverage() {
        console.log('📊 运行测试并生成覆盖率报告...\n');

        try {
            const { stdout, stderr } = await this.runJestTests('--coverage');
            return { stdout, stderr };
        } catch (error) {
            console.error('❌ 覆盖率报告生成失败:', error);
            throw error;
        }
    }

    /**
     * 运行测试监视模式
     */
    async runTestsInWatchMode() {
        console.log('👀 启动测试监视模式...\n');
        console.log('监视模式已启动，文件变更时将自动重新运行测试');
        console.log('按 q 退出监视模式\n');

        try {
            const { stdout, stderr } = await this.runJestTests('--watch');
            return { stdout, stderr };
        } catch (error) {
            console.error('❌ 监视模式启动失败:', error);
            throw error;
        }
    }

    /**
     * 运行特定测试文件
     */
    async runSpecificTestFile(filePath: string) {
        console.log(`🎯 运行特定测试文件: ${filePath}\n`);

        try {
            const { stdout, stderr } = await this.runJestTests(filePath);
            return { stdout, stderr };
        } catch (error) {
            console.error(`❌ 测试文件 ${filePath} 运行失败:`, error);
            throw error;
        }
    }

    /**
     * 运行测试并生成JUnit报告
     */
    async runTestsWithJUnitReport() {
        console.log('📋 运行测试并生成JUnit报告...\n');

        try {
            const { stdout, stderr } = await this.runJestTests('--coverage --testResultsProcessor="jest-junit"');
            return { stdout, stderr };
        } catch (error) {
            console.error('❌ JUnit报告生成失败:', error);
            throw error;
        }
    }

    /**
     * 清理测试缓存
     */
    async clearTestCache() {
        console.log('🧹 清理测试缓存...\n');

        try {
            const { stdout, stderr } = await this.runJestTests('--clearCache');
            console.log('✅ 测试缓存清理完成');
            return { stdout, stderr };
        } catch (error) {
            console.error('❌ 缓存清理失败:', error);
            throw error;
        }
    }

    /**
     * 显示测试帮助信息
     */
    showHelp() {
        const helpText = `
🎯 AI旅行规划器 - 单元测试模块帮助

可用命令:

1. 运行完整测试套件
   npm run test:full

2. 运行单元测试
   npm run test:unit

3. 运行集成测试
   npm run test:integration

4. 运行覆盖率检查
   npm run test:coverage

5. 运行特定模块测试
   npm run test:module -- <模块名>
   可用模块: auth, users, trips, budgets, ai-services, data-sync

6. 使用Jest CLI运行测试
   npm run test:jest -- <选项>

7. 运行测试监视模式
   npm run test:watch

8. 运行特定测试文件
   npm run test:file -- <文件路径>

9. 生成JUnit报告
   npm run test:junit

10. 清理测试缓存
    npm run test:clear-cache

测试配置:
- 测试环境: Node.js
- 测试框架: Jest + TypeScript
- 覆盖率工具: Istanbul
- 报告格式: HTML, LCOV, Text, JUnit

测试目录结构:
backend/src/__tests__/
├── core/                 # 测试核心工具
├── modules/              # 模块测试套件
│   ├── auth/            # 认证模块测试
│   ├── users/           # 用户管理模块测试
│   ├── trips/           # 行程管理模块测试
│   ├── budgets/         # 预算管理模块测试
│   ├── ai-services/     # AI服务模块测试
│   └── data-sync/       # 数据同步模块测试
├── test-setup.ts        # 测试环境设置
├── test-runner.ts       # 测试运行器
├── main.test-runner.ts  # 主测试运行器
└── jest.config.ts       # Jest配置

覆盖率阈值:
- 全局阈值: 80%
- 认证模块: 85%
- 用户管理: 85%
- 行程管理: 80%
- 预算管理: 80%
- AI服务: 75%
- 数据同步: 75%

注意事项:
- 确保所有依赖已安装: npm install
- 确保TypeScript配置正确
- 测试前请确保数据库连接正常
- 集成测试可能需要外部服务支持
    `;

        console.log(helpText);
    }
}

/**
 * 创建测试脚本实例
 */
export const createTestScripts = () => {
    return new TestScripts();
};

/**
 * 命令行接口
 */
if (require.main === module) {
    const scripts = createTestScripts();
    const args = process.argv.slice(2);

    const command = args[0];
    const param = args[1];

    (async () => {
        try {
            switch (command) {
                case 'help':
                case '--help':
                case '-h':
                    scripts.showHelp();
                    break;

                case 'unit':
                    await scripts.runUnitTests();
                    break;

                case 'integration':
                    await scripts.runIntegrationTests();
                    break;

                case 'coverage':
                    await scripts.runCoverageCheck();
                    break;

                case 'full':
                    await scripts.runFullTestSuite();
                    break;

                case 'module':
                    if (!param) {
                        console.error('❌ 请指定模块名');
                        process.exit(1);
                    }
                    await scripts.runModuleTests(param);
                    break;

                case 'jest':
                    await scripts.runJestTests(param || '');
                    break;

                case 'watch':
                    await scripts.runTestsInWatchMode();
                    break;

                case 'file':
                    if (!param) {
                        console.error('❌ 请指定测试文件路径');
                        process.exit(1);
                    }
                    await scripts.runSpecificTestFile(param);
                    break;

                case 'junit':
                    await scripts.runTestsWithJUnitReport();
                    break;

                case 'clear-cache':
                    await scripts.clearTestCache();
                    break;

                default:
                    console.log('🔧 使用 "npm run test:help" 查看可用命令');
                    break;
            }
        } catch (error) {
            console.error('❌ 命令执行失败:', error);
            process.exit(1);
        }
    })();
}

// 导出用于模块引用的接口
export default {
    TestScripts,
    createTestScripts
};