# 数据同步模块 (Module 14)

## 概述

数据同步模块是AI旅行规划师应用的核心模块之一，负责处理多设备间的数据同步、离线数据存储和冲突解决。该模块支持实时同步、离线操作和智能冲突解决。

## 功能特性

- ✅ **多设备同步**: 支持用户在不同设备间同步行程、预算等数据
- ✅ **离线操作**: 在网络不可用时支持离线数据操作
- ✅ **智能冲突解决**: 自动检测和解决数据冲突
- ✅ **可配置同步策略**: 支持默认同步和乐观同步策略
- ✅ **冲突解决策略**: 支持时间戳、智能和手动冲突解决
- ✅ **实时状态监控**: 提供同步状态和冲突信息

## 模块结构

```
data-sync/
├── controllers/          # 控制器层
│   └── sync.controller.ts
├── services/            # 服务层
│   └── sync.service.ts
├── strategies/          # 策略层
│   ├── sync.strategy.ts
│   └── conflict.strategy.ts
├── types/               # 类型定义
│   └── sync.types.ts
├── routes/              # 路由定义
│   └── sync.routes.ts
├── tests/               # 测试文件
│   ├── sync.service.test.ts
│   └── sync.controller.test.ts
└── index.ts             # 模块入口
```

## API接口

### 批量同步
- **端点**: `POST /api/sync/batch-sync`
- **认证**: 需要认证
- **功能**: 批量同步用户数据变更

### 获取同步状态
- **端点**: `GET /api/sync/status/:userId`
- **认证**: 需要认证
- **功能**: 获取用户的同步状态信息

### 获取冲突列表
- **端点**: `GET /api/sync/conflicts/:userId`
- **认证**: 需要认证
- **功能**: 获取用户的冲突列表

### 解决冲突
- **端点**: `POST /api/sync/conflicts/:userId/:conflictId/resolve`
- **认证**: 需要认证
- **功能**: 解决指定冲突

### 清理冲突
- **端点**: `DELETE /api/sync/conflicts/:userId/cleanup`
- **认证**: 需要认证
- **功能**: 清理已解决的冲突

### 获取用户配置
- **端点**: `GET /api/sync/config/:userId`
- **认证**: 需要认证
- **功能**: 获取用户的同步配置

### 更新用户配置
- **端点**: `PUT /api/sync/config/:userId`
- **认证**: 需要认证
- **功能**: 更新用户的同步配置

### 健康检查
- **端点**: `GET /api/sync/health`
- **认证**: 无需认证
- **功能**: 检查服务健康状态

## 核心类型定义

### SyncChange
数据变更对象，表示一次数据操作。

```typescript
interface SyncChange {
  id: string;           // 变更ID
  type: 'create' | 'update' | 'delete';  // 操作类型
  entity: string;       // 实体类型 (trip, budget等)
  entityId: string;     // 实体ID
  data: any;            // 变更数据
  timestamp: string;    // 时间戳
  userId: string;       // 用户ID
  deviceId: string;     // 设备ID
}
```

### SyncConflict
数据冲突对象，表示检测到的数据冲突。

```typescript
interface SyncConflict {
  id: string;           // 冲突ID
  localChange: SyncChange;  // 本地变更
  remoteChange: SyncChange; // 远程变更
  entity: string;       // 实体类型
  entityId: string;     // 实体ID
  description: string;  // 冲突描述
}
```

### SyncStatus
同步状态对象，表示用户的同步状态。

```typescript
interface SyncStatus {
  userId: string;       // 用户ID
  isSyncing: boolean;   // 是否正在同步
  lastSyncTime: string | null;  // 最后同步时间
  pendingChanges: number;       // 待同步变更数
  conflicts: number;    // 冲突数量
  deviceCount: number;  // 设备数量
}
```

## 同步策略

### DefaultSyncStrategy (默认同步策略)
- 基于时间戳的冲突检测
- 先到先得的冲突解决
- 适用于大多数场景

### OptimisticSyncStrategy (乐观同步策略)
- 假设冲突较少
- 允许并发修改
- 需要更复杂的冲突解决

## 冲突解决策略

### TimestampConflictStrategy (时间戳策略)
- 基于时间戳解决冲突
- 最新修改优先

### SmartConflictStrategy (智能策略)
- 基于内容分析解决冲突
- 支持自动合并

### ManualConflictStrategy (手动策略)
- 需要用户手动解决冲突
- 提供冲突详情和建议

## 使用示例

### 前端使用

```typescript
import { useDataSync } from '../features/data-sync';

function MyComponent() {
  const { 
    syncStatus, 
    startSync, 
    stopSync, 
    resolveConflict 
  } = useDataSync();

  // 开始同步
  const handleSync = async () => {
    await startSync();
  };

  // 解决冲突
  const handleResolveConflict = async (conflictId: string) => {
    await resolveConflict(conflictId, 'local');
  };

  return (
    <div>
      <p>同步状态: {syncStatus.isSyncing ? '同步中' : '空闲'}</p>
      <p>待同步变更: {syncStatus.pendingChanges}</p>
      <button onClick={handleSync}>开始同步</button>
    </div>
  );
}
```

### 后端API调用

```typescript
// 批量同步
const response = await fetch('/api/sync/batch-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    deviceId: 'device-456',
    changes: [/* 变更列表 */]
  })
});

// 获取同步状态
const statusResponse = await fetch('/api/sync/status/user-123');
const status = await statusResponse.json();
```

## 测试

运行测试：

```bash
npm test -- data-sync
```

或运行特定测试：

```bash
npm test -- sync.service.test.ts
npm test -- sync.controller.test.ts
```

## 依赖关系

- **模块02**: 用户认证模块 (用于用户验证)
- **模块03**: 数据存储模块 (用于数据持久化)
- Express.js (Web框架)
- TypeScript (类型系统)

## 开发注意事项

1. **数据一致性**: 确保同步操作的数据一致性
2. **性能优化**: 批量同步时注意数据量控制
3. **错误处理**: 完善的错误处理和重试机制
4. **安全性**: 严格的用户权限验证
5. **日志记录**: 详细的同步操作日志

## 版本历史

- **v1.0.0** (2024-01-01): 初始版本，基础同步功能
- **v1.1.0** (2024-01-15): 添加智能冲突解决策略
- **v1.2.0** (2024-02-01): 优化离线存储和同步性能

## 贡献指南

1. 遵循项目代码规范
2. 添加相应的单元测试
3. 更新API文档
4. 进行充分的测试验证

## 许可证

本项目采用MIT许可证。