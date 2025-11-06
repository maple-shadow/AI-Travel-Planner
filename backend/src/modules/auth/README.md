# 认证模块 (Authentication Module)

## 概述

认证模块是AI旅行规划师项目的核心模块，负责处理用户注册、登录、Token管理、权限验证等功能。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT Token管理
- ✅ 密码哈希和验证
- ✅ Token刷新机制
- ✅ 权限验证中间件
- ✅ 输入验证器
- ✅ 速率限制
- ✅ CORS支持
- ✅ 完整的类型定义
- ✅ 单元测试覆盖

## 目录结构

```
auth/
├── controllers/           # 控制器
│   ├── auth.controller.ts
│   └── token.controller.ts
├── services/              # 服务层
│   ├── auth.service.ts
│   └── token.service.ts
├── middleware/            # 中间件
│   └── auth.middleware.ts
├── validators/            # 验证器
│   └── auth.validators.ts
├── routes/                # 路由
│   └── auth.routes.ts
├── types/                 # 类型定义
│   └── auth.types.ts
├── config/                # 配置
│   └── auth.config.ts
├── tests/                 # 测试文件
│   └── auth.test.ts
├── index.ts               # 模块入口
└── README.md              # 说明文档
```

## 快速开始

### 1. 安装依赖

确保项目已安装以下依赖：

```bash
npm install bcryptjs jsonwebtoken express-validator cors express-rate-limit
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### 2. 环境变量配置

在 `.env` 文件中配置以下环境变量：

```env
# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# 密码哈希
PASSWORD_SALT_ROUNDS=12

# CORS配置
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. 集成到主应用

```typescript
import { initializeAuthModule } from './modules/auth';

// 初始化认证模块
const authModule = initializeAuthModule();

// 使用认证路由
app.use('/api/auth', authModule.routes);

// 使用认证中间件（可选）
app.use(authModule.middleware.authenticateToken);
```

## API接口

### 认证接口

#### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "TestPass123!",
  "email": "test@example.com"
}
```

**响应：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "user-id",
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "user-id",
      "username": "testuser",
      "email": "test@example.com"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

### Token管理接口

#### Token验证

```http
GET /api/auth/verify
Authorization: Bearer <access-token>
```

**响应：**
```json
{
  "success": true,
  "message": "Token有效",
  "data": {
    "user": {
      "id": "user-id",
      "username": "testuser",
      "email": "test@example.com"
    },
    "valid": true
  }
}
```

#### Token刷新

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Token刷新成功",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

#### Token撤销

```http
POST /api/auth/revoke
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "token": "token-to-revoke"
}
```

## 中间件使用

### Token认证中间件

```typescript
import { AuthMiddleware } from './modules/auth';

const authMiddleware = new AuthMiddleware();

// 保护需要认证的路由
app.get('/protected-route', 
  authMiddleware.authenticateToken,
  (req, res) => {
    // req.user 包含认证用户信息
    res.json({ user: req.user });
  }
);
```

### 权限验证中间件

```typescript
// 验证用户权限
app.put('/users/:id',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeUser('userId'), // 验证用户ID匹配
  (req, res) => {
    // 只有资源所有者可以访问
    res.json({ message: '权限验证通过' });
  }
);
```

### 速率限制中间件

```typescript
// 应用速率限制
app.post('/login',
  authMiddleware.rateLimit('login'), // 登录速率限制
  authController.login
);

app.post('/register',
  authMiddleware.rateLimit('register'), // 注册速率限制
  authController.register
);
```

## 配置说明

### 开发环境配置

```typescript
import { authConfigDevelopment } from './modules/auth/config/auth.config';

// 开发环境使用较宽松的配置
console.log(authConfigDevelopment);
```

### 生产环境配置

```typescript
import { authConfigProduction } from './modules/auth/config/auth.config';

// 生产环境使用严格的配置
console.log(authConfigProduction);
```

### 自定义配置

```typescript
import { getAuthConfig } from './modules/auth/config/auth.config';

// 根据环境获取配置
const config = getAuthConfig();

// 自定义配置
const customConfig = {
  ...config,
  tokenExpiry: '30m', // 延长Token过期时间
  passwordSaltRounds: 10 // 调整盐轮数
};
```

## 验证规则

### 用户名规则
- 长度：3-20个字符
- 允许字符：字母、数字、下划线
- 不允许：空格、特殊字符

### 密码规则
- 长度：至少8个字符
- 必须包含：大写字母、小写字母、数字、特殊字符
- 强度评分：0-100分

### 邮箱规则
- 标准邮箱格式验证
- 不允许：无效格式、空值

## 错误处理

### 常见错误类型

```typescript
import { AuthErrorType } from './modules/auth/types/auth.types';

// 错误处理示例
app.use((error, req, res, next) => {
  if (error.type === AuthErrorType.TOKEN_EXPIRED) {
    return res.status(401).json({
      success: false,
      message: 'Token已过期',
      error: AuthErrorType.TOKEN_EXPIRED
    });
  }
  
  // 其他错误处理...
});
```

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": "ERROR_TYPE",
  "details": {
    // 错误详情（可选）
  }
}
```

## 测试

### 运行测试

```bash
# 运行认证模块测试
npm test -- auth

# 运行所有测试
npm test
```

### 测试覆盖范围

- ✅ 认证服务测试
- ✅ Token服务测试  
- ✅ 验证器测试
- ✅ 配置测试
- ✅ 集成测试
- ✅ 错误处理测试
- ✅ 性能测试

## 安全考虑

### 密码安全
- 使用bcryptjs进行密码哈希
- 可配置的盐轮数（默认12轮）
- 密码强度验证

### Token安全
- JWT Token签名验证
- Token过期机制
- Token黑名单管理
- 刷新Token机制

### 速率限制
- 登录尝试限制
- 注册频率限制
- 通用API限制

### CORS安全
- 可配置的允许源
- 生产环境严格限制

## 部署说明

### 生产环境配置

1. **修改JWT密钥**：确保使用强密钥
2. **调整Token过期时间**：根据安全需求调整
3. **配置CORS**：设置正确的允许源
4. **启用HTTPS**：生产环境必须使用HTTPS

### 环境变量示例

```env
# 生产环境配置
NODE_ENV=production
JWT_SECRET=your-strong-production-secret-key
TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PASSWORD_SALT_ROUNDS=12
ALLOWED_ORIGINS=https://yourdomain.com
```

## 故障排除

### 常见问题

1. **Token验证失败**
   - 检查JWT密钥配置
   - 验证Token格式
   - 检查Token过期时间

2. **密码验证失败**
   - 检查密码哈希算法
   - 验证盐轮数配置
   - 检查输入密码格式

3. **CORS错误**
   - 检查允许源配置
   - 验证前端域名
   - 检查HTTPS配置

### 日志调试

启用详细日志进行调试：

```typescript
// 开发环境启用详细日志
if (process.env.NODE_ENV === 'development') {
  console.log('认证模块调试信息:', debugInfo);
}
```

## 贡献指南

### 代码规范
- 使用TypeScript严格模式
- 遵循项目代码风格
- 添加必要的注释和文档

### 测试要求
- 新功能必须包含测试
- 保持测试覆盖率
- 测试边界条件和错误情况

### 提交规范
- 使用语义化提交信息
- 关联相关Issue
- 进行代码审查

## 许可证

本项目采用MIT许可证。详情请参阅LICENSE文件。

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础认证功能
- 完整测试覆盖
- 详细文档

---

如有问题或建议，请创建Issue或联系开发团队。