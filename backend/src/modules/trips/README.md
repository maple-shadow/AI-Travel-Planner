# 模块07：行程数据模型模块

## 模块概述

**模块名称**：行程数据模型模块  
**模块类型**：后端业务模块  
**开发阶段**：第三阶段 - 核心业务功能  
**依赖关系**：依赖模块03（后端核心架构）

## 功能特性

- ✅ 行程数据模型定义
- ✅ 行程CRUD操作
- ✅ 数据验证和错误处理
- ✅ 行程搜索和筛选
- ✅ 数据库迁移脚本
- ✅ 单元测试覆盖
- ✅ API路由和控制器

## 目录结构

```
backend/src/modules/trips/
├── models/                  # 数据模型
│   └── trip.model.ts       # 行程模型
├── validators/             # 验证器
│   └── trip.validators.ts  # 行程验证器
├── types/                  # 类型定义
│   └── trip.types.ts       # 行程相关类型
├── controllers/             # 控制器
│   └── trip.controller.ts  # 行程控制器
├── routes/                 # 路由
│   └── trip.routes.ts     # 行程路由
├── migrations/            # 数据库迁移
│   └── create_trips_table.ts # 行程表迁移
├── tests/                 # 测试文件
│   └── trip.test.ts       # 单元测试
├── index.ts               # 模块入口
└── README.md             # 说明文档
```

## 快速开始

### 1. 初始化模块

```typescript
import { initializeTripModule } from './modules/trips'

// 初始化行程模块
await initializeTripModule()
console.log('✅ 行程数据模型模块初始化完成')
```

### 2. 使用行程模型

```typescript
import { TripModel, TripTypes } from './modules/trips'

// 创建行程
const newTrip = await TripModel.createTrip({
  user_id: 'user-uuid',
  title: '北京三日游',
  destination: '北京',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-03'),
  status: TripTypes.TripStatus.PLANNING,
  type: TripTypes.TripType.LEISURE,
  priority: TripTypes.TripPriority.MEDIUM,
  budget: 5000,
  tags: ['文化', '历史']
})

// 查找行程
const trip = await TripModel.findTripById('trip-uuid')

// 更新行程
const updatedTrip = await TripModel.updateTrip('trip-uuid', {
  title: '更新后的行程标题'
})

// 删除行程
await TripModel.deleteTrip('trip-uuid')

// 获取用户行程列表
const userTrips = await TripModel.listUserTrips('user-uuid')

// 搜索行程
const searchResults = await TripModel.searchTrips('user-uuid', '北京')

// 获取即将到来的行程
const upcomingTrips = await TripModel.getUpcomingTrips('user-uuid', 30)
```

### 3. 使用数据验证

```typescript
import { TripValidators } from './modules/trips'

// 验证行程数据
const validationErrors = TripValidators.validateTripData({
  title: '测试行程',
  destination: '上海',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-03')
})

if (validationErrors.length > 0) {
  console.error('验证失败:', validationErrors)
}
```

## API接口

### 行程相关API

| 方法   | 路径                  | 描述               | 认证要求 |
| ------ | --------------------- | ------------------ | -------- |
| POST   | `/api/trips`          | 创建新行程         | 需要认证 |
| GET    | `/api/trips`          | 获取用户行程列表   | 需要认证 |
| GET    | `/api/trips/search`   | 搜索行程           | 需要认证 |
| GET    | `/api/trips/upcoming` | 获取即将到来的行程 | 需要认证 |
| GET    | `/api/trips/stats`    | 获取行程统计信息   | 需要认证 |
| GET    | `/api/trips/:id`      | 根据ID获取行程详情 | 需要认证 |
| PUT    | `/api/trips/:id`      | 更新行程信息       | 需要认证 |
| DELETE | `/api/trips/:id`      | 删除行程           | 需要认证 |

### 请求示例

#### 创建行程

```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "user_id": "user-uuid",
    "title": "北京三日游",
    "destination": "北京",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-03T23:59:59.999Z",
    "budget": 5000,
    "tags": ["文化", "历史"]
  }'
```

#### 获取行程列表

```bash
curl -X GET "http://localhost:3000/api/trips?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## 数据模型

### 行程表结构

| 字段名      | 类型          | 约束                  | 描述         |
| ----------- | ------------- | --------------------- | ------------ |
| id          | UUID          | PRIMARY KEY           | 行程唯一标识 |
| user_id     | UUID          | NOT NULL, FOREIGN KEY | 用户ID       |
| title       | VARCHAR(100)  | NOT NULL              | 行程标题     |
| description | TEXT          | NULLABLE              | 行程描述     |
| destination | VARCHAR(200)  | NOT NULL              | 目的地       |
| start_date  | TIMESTAMP     | NOT NULL              | 开始日期     |
| end_date    | TIMESTAMP     | NOT NULL              | 结束日期     |
| status      | ENUM          | NOT NULL              | 行程状态     |
| type        | ENUM          | NOT NULL              | 行程类型     |
| priority    | ENUM          | NOT NULL              | 优先级       |
| budget      | DECIMAL(15,2) | NULLABLE              | 预算         |
| tags        | TEXT[]        | NULLABLE              | 标签数组     |
| created_at  | TIMESTAMP     | DEFAULT NOW()         | 创建时间     |
| updated_at  | TIMESTAMP     | DEFAULT NOW()         | 更新时间     |

### 枚举值定义

#### 行程状态 (TripStatus)
- `planning` - 规划中
- `confirmed` - 已确认
- `in_progress` - 进行中
- `completed` - 已完成
- `cancelled` - 已取消
- `postponed` - 已延期

#### 行程类型 (TripType)
- `business` - 商务旅行
- `leisure` - 休闲旅行
- `family` - 家庭旅行
- `adventure` - 冒险旅行
- `educational` - 教育旅行
- `other` - 其他

#### 优先级 (TripPriority)
- `low` - 低优先级
- `medium` - 中优先级
- `high` - 高优先级
- `urgent` - 紧急

## 验证规则

### 数据验证

- **标题**: 必填，长度1-100字符
- **目的地**: 必填，长度1-200字符
- **描述**: 可选，最大1000字符
- **日期**: 开始日期不能早于当前时间，结束日期必须晚于开始日期
- **预算**: 必须为正数，最大1000万
- **标签**: 最多10个标签，每个标签最大20字符

### 错误代码

| 错误代码               | 描述                      |
| ---------------------- | ------------------------- |
| TITLE_REQUIRED         | 行程标题不能为空          |
| TITLE_TOO_LONG         | 行程标题不能超过100个字符 |
| DESTINATION_REQUIRED   | 目的地不能为空            |
| DESTINATION_TOO_LONG   | 目的地不能超过200个字符   |
| DESCRIPTION_TOO_LONG   | 描述不能超过1000个字符    |
| INVALID_START_DATE     | 开始日期格式无效          |
| START_DATE_IN_PAST     | 开始日期不能早于当前时间  |
| END_DATE_BEFORE_START  | 结束日期必须晚于开始日期  |
| TRIP_DURATION_TOO_LONG | 行程时长不能超过2年       |
| NEGATIVE_BUDGET        | 预算不能为负数            |
| BUDGET_TOO_HIGH        | 预算不能超过1000万        |

## 测试

运行单元测试：

```bash
cd backend
npm test -- modules/trips/tests/trip.test.ts
```

测试覆盖范围：
- ✅ 行程模型CRUD操作
- ✅ 数据验证逻辑
- ✅ 错误处理
- ✅ 类型定义
- ✅ 模块初始化

## 数据库迁移

### 创建行程表

模块包含自动迁移脚本，首次使用时会自动创建行程表：

```typescript
import { TripMigrations } from './modules/trips'

// 手动运行迁移
await TripMigrations.runMigration(databaseConnection)
```

### 迁移SQL

迁移脚本会创建以下数据库对象：
- 行程表 (trips)
- 必要的索引
- 全文搜索索引
- 约束检查
- 自动更新触发器

## 集成说明

### 与认证模块集成

行程模块依赖于认证模块，所有API操作都需要用户认证：

```typescript
// 在路由中使用认证中间件
import { authMiddleware } from '../auth/middleware/auth.middleware'
import tripRoutes from './routes/trip.routes'

app.use('/api/trips', authMiddleware, tripRoutes)
```

### 健康检查

```typescript
import { healthCheck } from './modules/trips'

const status = await healthCheck()
console.log(`模块状态: ${status.status}`) // healthy 或 unhealthy
```

## 开发规范

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 编写完整的JSDoc注释
- 错误处理使用try-catch

### 安全考虑
- 所有用户操作都验证用户权限
- 输入数据经过严格验证
- 使用参数化查询防止SQL注入
- 敏感信息不记录在日志中

## 版本历史

| 版本  | 日期       | 描述         |
| ----- | ---------- | ------------ |
| 1.0.0 | 2024-01-01 | 初始版本发布 |

## 技术支持

如有问题或建议，请联系开发团队。