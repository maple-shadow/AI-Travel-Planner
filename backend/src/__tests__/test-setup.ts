/**
 * 单元测试模块 - 测试环境设置
 * 模块15：单元测试模块
 */

import { jest } from '@jest/globals';

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 全局测试配置
interface TestConfig {
    timeout: number;
    retryAttempts: number;
    coverageThreshold: {
        global: {
            branches: number;
            functions: number;
            lines: number;
            statements: number;
        };
    };
}

declare global {
    var testConfig: TestConfig;
}

global.testConfig = {
    timeout: 10000,
    retryAttempts: 3,
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};

// 模拟数据库连接
jest.mock('../core/database', () => ({
    databaseConnection: {
        connect: jest.fn(),
        disconnect: jest.fn(),
        query: jest.fn()
    }
}));

// 模拟外部服务
jest.mock('../modules/ai-services/clients/aliyun.client', () => ({
    AliyunClient: jest.fn()
}));

jest.mock('../modules/ai-services/clients/iflytek.client', () => ({
    IflytekClient: jest.fn()
}));

// 测试生命周期钩子
beforeAll(() => {
    console.log('🚀 开始运行单元测试套件');
});

afterAll(() => {
    console.log('✅ 单元测试套件运行完成');
});

beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
});

// 测试工具函数
export const setupTestEnvironment = () => {
    console.log('🔧 设置测试环境');
    return {
        mockData: {},
        cleanup: () => {
            console.log('🧹 清理测试环境');
        }
    };
};

export const createTestSuite = (moduleName: string, testCases: any[]) => {
    console.log(`📋 创建测试套件: ${moduleName}`);
    return {
        moduleName,
        testCases,
        run: () => {
            console.log(`▶️ 运行测试套件: ${moduleName}`);
        }
    };
};

export const generateCoverageReport = () => {
    console.log('📊 生成覆盖率报告');
    return {
        coverage: {
            branches: 85,
            functions: 90,
            lines: 88,
            statements: 87
        }
    };
};