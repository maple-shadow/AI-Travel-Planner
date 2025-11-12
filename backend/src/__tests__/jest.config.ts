/**
 * 单元测试模块 - Jest配置文件
 * 模块15：单元测试模块
 */

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    // 预设配置
    preset: 'ts-jest',

    // 测试环境
    testEnvironment: 'node',

    // 测试文件匹配规则
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
        '**/main.test-runner.ts'
    ],

    // 模块文件扩展名
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // 模块名称映射
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@tests/(.*)$': '<rootDir>/src/__tests__/$1'
    },

    // 转换配置
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },

    // 覆盖率配置
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/**/types/**',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**'
    ],

    // 覆盖率目录
    coverageDirectory: 'coverage',

    // 覆盖率报告格式
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json'
    ],

    // 覆盖率阈值
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        // 模块特定的覆盖率阈值
        './src/modules/auth/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        },
        './src/modules/users/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        },
        './src/modules/trips/': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        './src/modules/budgets/': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        './src/modules/ai-services/': {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75
        },
        './src/modules/data-sync/': {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75
        }
    },

    // 测试运行前执行的脚本
    setupFilesAfterEnv: [
        '<rootDir>/src/__tests__/test-setup.ts'
    ],

    // 模块路径忽略
    modulePathIgnorePatterns: [
        '<rootDir>/dist/',
        '<rootDir>/node_modules/'
    ],

    // 测试超时时间
    testTimeout: 30000,

    // 详细输出
    verbose: true,

    // 颜色输出
    // colors: true, // Jest 28+ 不再支持此属性

    // 测试结果缓存
    cache: true,

    // 缓存目录
    cacheDirectory: '<rootDir>/node_modules/.cache/jest',

    // 测试运行器
    runner: 'jest-runner',

    // 测试报告器
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'test-results',
            outputName: 'junit.xml'
        }]
    ],

    // 全局变量
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
            diagnostics: {
                warnOnly: true
            }
        }
    },

    // 测试文件监视模式
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ],

    // 测试运行通知
    notify: true,
    notifyMode: 'failure-change',

    // 测试运行前清理
    clearMocks: true,

    // 重置模块
    resetModules: true,

    // 恢复模拟
    restoreMocks: true,

    // 测试运行前重置模块注册表
    resetMocks: true
};

export default config;