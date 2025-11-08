# 前端认证模块 (模块05)

## 概述

前端认证模块是AI-Travel-Planner项目的核心认证系统，提供完整的用户认证功能，包括登录、注册、认证状态管理、路由保护等。

## 功能特性

- ✅ 用户登录/注册
- ✅ 认证状态管理
- ✅ Token自动刷新
- ✅ 路由保护
- ✅ 用户信息管理
- ✅ 错误处理
- ✅ 表单验证

## 目录结构

```
frontend/src/core/auth/
├── components/           # 认证相关组件
│   ├── LoginForm.tsx    # 登录表单组件
│   ├── RegisterForm.tsx # 注册表单组件
│   ├── AuthStatus.tsx   # 认证状态组件
│   └── ProtectedRoute.tsx # 路由保护组件
├── hooks/               # 认证相关Hook
│   ├── useAuth.ts       # 主认证Hook
│   └── useAuthActions.ts # 认证操作Hook
├── types/               # 类型定义
│   └── auth.types.ts    # 认证相关类型
└── index.ts            # 模块主入口
```

## 快速开始

### 1. 导入认证模块

```typescript
import { 
  useAuth, 
  LoginForm, 
  RegisterForm, 
  AuthStatus, 
  ProtectedRoute 
} from '../core/auth';
```

### 2. 使用认证Hook

```typescript
const { 
  isAuthenticated, 
  user, 
  login, 
  register, 
  logout, 
  loading, 
  error 
} = useAuth();
```

### 3. 使用认证组件

#### 登录表单
```tsx
<LoginForm 
  onSuccess={handleLoginSuccess}
  onError={handleLoginError}
  redirectTo="/dashboard"
/>
```

#### 注册表单
```tsx
<RegisterForm 
  onSuccess={handleRegisterSuccess}
  onError={handleRegisterError}
  redirectTo="/login"
/>
```

#### 认证状态显示
```tsx
<AuthStatus 
  showUserInfo={true}
  showLogoutButton={true}
/>
```

#### 路由保护
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

## 核心组件说明

### LoginForm 组件

登录表单组件，包含邮箱密码验证、错误处理和登录逻辑。

**Props:**
- `onSuccess?: () => void` - 登录成功回调
- `onError?: (error: string) => void` - 登录错误回调
- `redirectTo?: string` - 登录后重定向路径

### RegisterForm 组件

注册表单组件，包含用户信息验证、密码强度指示和注册逻辑。

**Props:**
- `onSuccess?: () => void` - 注册成功回调
- `onError?: (error: string) => void` - 注册错误回调
- `redirectTo?: string` - 注册后重定向路径

### AuthStatus 组件

显示当前用户认证状态和用户信息的组件。

**Props:**
- `showUserInfo?: boolean` - 是否显示用户信息
- `showLogoutButton?: boolean` - 是否显示登出按钮

### ProtectedRoute 组件

保护需要认证才能访问的路由组件。

**Props:**
- `children: React.ReactNode` - 需要保护的子组件
- `requiredRole?: string` - 要求的用户角色
- `fallbackPath?: string` - 认证失败时重定向路径

## Hook API

### useAuth Hook

主认证Hook，提供完整的认证功能。

**返回值:**
```typescript
{
  isAuthenticated: boolean;      // 是否已认证
  user: User | null;             // 用户信息
  loading: boolean;              // 加载状态
  error: string | null;          // 错误信息
  login: (credentials: LoginCredentials) => Promise<void>;     // 登录方法
  register: (data: RegisterData) => Promise<void>;             // 注册方法
  logout: () => Promise<void>;                                 // 登出方法
  clearError: () => void;                                      // 清除错误
  refreshToken: () => Promise<void>;                          // 刷新Token
}
```

### useAuthState Hook

仅获取认证状态的Hook。

**返回值:**
```typescript
{
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### useAuthActions Hook

仅获取认证操作的Hook。

**返回值:**
```typescript
{
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}
```

## 类型定义

### AuthState
```typescript
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### LoginCredentials
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

### RegisterData
```typescript
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

## 集成示例

### 在App.tsx中使用

```tsx
import { useAuth, AuthStatus } from './core/auth';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <header>
        <AuthStatus />
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}
```

### 在页面组件中使用

```tsx
// LoginPage.tsx
import { LoginForm } from '../core/auth';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <h1>登录</h1>
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};
```

## 配置选项

认证模块支持以下配置选项：

```typescript
interface AuthModuleConfig {
  loginRedirectPath?: string;        // 登录后重定向路径
  registerRedirectPath?: string;     // 注册后重定向路径
  logoutRedirectPath?: string;       // 登出后重定向路径
  tokenRefreshInterval?: number;    // Token刷新间隔
  autoRefreshToken?: boolean;        // 是否自动刷新Token
}
```

初始化配置：

```typescript
import { initializeAuthModule } from '../core/auth';

const authModule = initializeAuthModule({
  loginRedirectPath: '/dashboard',
  tokenRefreshInterval: 15 * 60 * 1000, // 15分钟
});
```

## 错误处理

认证模块提供完整的错误处理机制：

1. **表单验证错误** - 实时显示在表单字段下方
2. **API错误** - 显示在表单顶部的错误区域
3. **网络错误** - 自动重试机制
4. **Token过期** - 自动刷新Token

## 依赖关系

- React 18+
- Redux Toolkit
- React Router DOM
- Axios
- TypeScript

## 开发指南

### 添加新的认证方法

1. 在 `auth.types.ts` 中添加新的类型定义
2. 在 `useAuth.ts` 中添加新的Hook方法
3. 在 `authSlice.ts` 中添加对应的Redux逻辑
4. 创建对应的组件（如果需要）

### 自定义验证规则

修改 `LoginForm.tsx` 和 `RegisterForm.tsx` 中的 `validateForm` 方法来自定义验证规则。

## 测试

认证模块包含完整的单元测试和集成测试：

```bash
# 运行认证模块测试
npm test -- --testPathPattern="auth"
```

## 版本信息

- 版本: 1.0.0
- 状态: 生产就绪
- 最后更新: 2024年

## 贡献指南

欢迎提交Issue和Pull Request来改进认证模块。