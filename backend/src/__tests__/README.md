# 模块15：单元测试模块

## 概述

单元测试模块是AI旅行规划器项目的核心测试框架，为所有功能模块提供完整的测试覆盖。本模块基于Jest测试框架构建，支持TypeScript，提供单元测试、集成测试、覆盖率检查等功能。

## 功能特性

- ✅ **完整的测试框架**：基于Jest + TypeScript构建
- ✅ **模块化测试套件**：每个功能模块都有独立的测试套件
- ✅ **覆盖率检查**：支持分支、函数、行、语句覆盖率检查
- ✅ **集成测试**：模块间集成功能测试
- ✅ **多种报告格式**：HTML、LCOV、Text、JUnit报告
- ✅ **命令行工具**：丰富的测试脚本和工具
- ✅ **监视模式**：文件变更时自动重新运行测试
- ✅ **缓存管理**：智能测试缓存优化

## 目录结构

```
backend/src/__tests__/
├── core/                           # 测试核心工具
│   └── test-runner.ts              # 测试运行器
├── modules/                        # 模块测试套件
│   ├── auth/                       # 认证模块测试
│   │   └── auth.test-suite.ts      # 认证测试套件
│   ├── users/                      # 用户管理模块测试
│   │   └── user.test-suite.ts      # 用户管理测试套件
│   ├── trips/                      # 行程管理模块测试
│   │   └── trip.test-suite.ts      # 行程管理测试套件
│   ├── budgets/                    # 预算管理模块测试
│   │   └── budget.test-suite.ts     # 预算管理测试套件
│   ├── ai-services/                # AI服务模块测试
│   │   └── ai.test-suite.ts        # AI服务测试套件
│   └── data-sync/                  # 数据同步模块测试
│       └── sync.test-suite.ts      # 数据同步测试套件
├── test-setup.ts                   # 测试环境设置
├── main.test-runner.ts             # 主测试运行器
├── test-scripts.ts                 # 测试脚本工具
├── jest.config.ts                  # Jest配置文件
└── README.md                       # 本文档
```

## 快速开始

### 1. 安装依赖

确保已安装所有项目依赖：

```bash
cd backend
npm install
```

### 2. 查看帮助信息

```bash
npm run test:help
```

### 3. 运行完整测试套件

```bash
npm run test:full
```

## 测试脚本

### 基本测试命令

| 命令                       | 描述             |
| -------------------------- | ---------------- |
| `npm run test:unit`        | 运行所有单元测试 |
| `npm run test:integration` | 运行集成测试     |
| `npm run test:coverage`    | 运行覆盖率检查   |
| `npm run test:full`        | 运行完整测试套件 |

### 模块测试

```bash
# 运行特定模块测试
npm run test:module -- auth
npm run test:module -- users
npm run test:module -- trips
npm run test:module -- budgets
npm run test:module -- ai-services
npm run test:module -- data-sync
```

### 高级测试选项

```bash
# 使用Jest CLI运行测试
npm run test:jest -- --verbose

# 运行测试监视模式
npm run test:watch

# 运行特定测试文件
npm run test:file -- src/__tests__/modules/auth/auth.test-suite.ts

# 生成JUnit报告
npm run test:junit

# 清理测试缓存
npm run test:clear-cache
```

## 测试套件说明

### 认证模块测试套件 (auth.test-suite.ts)

- 用户注册功能测试
- 用户登录功能测试
- Token管理测试
- 权限验证测试
- 错误处理测试

### 用户管理模块测试套件 (user.test-suite.ts)

- 用户信息查询测试
- 用户信息更新测试
- 密码管理测试
- 权限管理测试
- 用户统计测试

### 行程管理模块测试套件 (trip.test-suite.ts)

- 行程创建功能测试
- 行程查询功能测试
- 行程更新功能测试
- 行程删除功能测试
- 行程统计测试

### 预算管理模块测试套件 (budget.test-suite.ts)

- 预算创建功能测试
- 预算查询功能测试
- 预算更新功能测试
- 开销管理测试
- 预算分析测试

### AI服务模块测试套件 (ai.test-suite.ts)

- 行程规划功能测试
- 预算优化测试
- 语音AI功能测试
- AI客户端测试
- 错误处理测试

### 数据同步模块测试套件 (sync.test-suite.ts)

- 同步初始化功能测试
- 数据变更队列测试
- 冲突解决功能测试
- 同步策略测试
- 离线同步测试

## 覆盖率配置

### 全局覆盖率阈值

```typescript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### 模块特定阈值

| 模块     | 分支 | 函数 | 行  | 语句 |
| -------- | ---- | ---- | --- | ---- |
| 认证模块 | 85%  | 85%  | 85% | 85%  |
| 用户管理 | 85%  | 85%  | 85% | 85%  |
| 行程管理 | 80%  | 80%  | 80% | 80%  |
| 预算管理 | 80%  | 80%  | 80% | 80%  |
| AI服务   | 75%  | 75%  | 75% | 75%  |
| 数据同步 | 75%  | 75%  | 75% | 75%  |

## 测试环境配置

### Jest配置 (jest.config.ts)

```typescript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/test-setup.ts']
}
```

### 测试环境设置 (test-setup.ts)

- 环境变量配置
- 全局测试配置
- 数据库模拟
- 外部服务模拟
- 测试生命周期钩子

## 集成测试

### 测试场景

1. **用户认证流程**
   - 用户注册 → 登录 → 权限验证

2. **行程预算关联**
   - 行程创建 → 预算分配 → 开销管理

3. **AI规划集成**
   - AI行程规划 → 预算优化 → 方案生成

4. **数据同步流程**
   - 离线数据变更 → 网络恢复 → 冲突解决

## 错误处理

### 测试错误类型

- 数据库连接错误
- 网络请求错误
- 数据验证错误
- 权限验证错误
- 并发操作错误

### 错误处理策略

- 模拟错误场景
- 验证错误响应
- 测试错误恢复
- 记录错误日志

## 最佳实践

### 1. 测试命名规范

```typescript
// 好的命名
describe('用户注册功能测试', () => {
  it('应该成功注册新用户', () => { ... });
  it('应该验证用户注册数据', () => { ... });
});

// 避免的命名
describe('测试用户', () => {
  it('测试1', () => { ... });
});
```

### 2. 测试隔离

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // 重置测试状态
});

afterEach(() => {
  // 清理测试资源
});
```

### 3. 模拟外部依赖

```typescript
// 模拟数据库操作
jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);

// 模拟网络请求
jest.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);
```

### 4. 覆盖率优化

- 编写边界条件测试
- 测试错误处理路径
- 验证数据验证逻辑
- 测试权限控制

## 故障排除

### 常见问题

1. **测试运行缓慢**
   - 清理测试缓存：`npm run test:clear-cache`
   - 检查数据库连接配置
   - 优化测试数据量

2. **覆盖率报告不准确**
   - 确保测试文件路径正确
   - 检查覆盖率排除配置
   - 验证TypeScript编译配置

3. **集成测试失败**
   - 检查外部服务连接
   - 验证测试数据准备
   - 检查网络连接状态

### 调试技巧

```bash
# 详细输出
npm run test:jest -- --verbose

# 调试特定测试
npm run test:jest -- --testNamePattern="用户注册"

# 查看测试缓存
npm run test:jest -- --showConfig
```

## 持续集成

### GitHub Actions 示例

```yaml
name: 单元测试
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:full
      - run: npm run test:junit
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## 贡献指南

### 添加新测试

1. 在对应模块目录创建测试文件
2. 遵循现有测试结构和命名规范
3. 确保测试覆盖所有主要功能
4. 验证错误处理场景
5. 更新覆盖率阈值配置

### 测试代码审查

- 检查测试覆盖完整性
- 验证测试逻辑正确性
- 确保测试数据隔离
- 验证错误处理场景
- 检查性能影响

## 版本历史

### v1.0.0 (2024-01-01)

- 初始版本发布
- 支持6个核心模块测试
- 完整的测试框架和工具链
- 覆盖率检查和报告生成
- 命令行测试脚本

## 联系方式

如有问题或建议，请联系开发团队或提交GitHub Issue。

---

**模块15：单元测试模块** - 为AI旅行规划器提供可靠的测试保障