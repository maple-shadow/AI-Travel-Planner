# AI服务集成模块

## 模块概述

AI服务集成模块是AI旅行规划师项目的核心AI能力提供模块，负责集成百炼API服务和科大讯飞语音服务，为系统提供智能行程规划、预算分析和语音交互功能。

## 功能特性

### 1. 智能行程规划
- **生成行程规划**: 根据用户需求生成详细的旅行行程
- **优化行程路线**: 基于时间、成本或体验优化现有行程
- **推荐活动**: 根据目的地和兴趣推荐适合的活动
- **分析偏好**: 基于历史旅行记录分析用户偏好

### 2. 智能预算分析
- **分析预算模式**: 基于旅行信息和历史开销进行预算分析
- **预测开销趋势**: 预测未来旅行开销趋势
- **建议预算优化**: 提供预算优化建议
- **生成预算建议**: 基于用户财务状况生成个性化预算建议

### 3. 语音交互服务
- **语音转文本**: 将用户语音转换为文本
- **文本转语音**: 将文本转换为语音输出
- **语音意图分析**: 分析语音中的用户意图和实体

## 技术架构

### 目录结构
```
ai-services/
├── services/                # AI服务实现
│   ├── ai.trip.service.ts   # 行程规划服务
│   ├── ai.budget.service.ts # 预算分析服务
│   └── ai.voice.service.ts  # 语音服务
├── clients/                 # AI客户端
│   ├── bailian.client.ts   # 百炼API客户端
│   └── iflytek.client.ts   # 科大讯飞客户端
├── utils/                   # 工具函数
│   └── ai.utils.ts         # AI工具函数
├── types/                   # 类型定义
│   └── ai.types.ts         # AI相关类型
├── controllers/             # 控制器
│   └── ai.controller.ts    # AI服务控制器
├── routes/                  # 路由定义
│   └── ai.routes.ts        # AI服务路由
├── config/                  # 配置文件
│   └── ai.config.ts        # AI服务配置
├── validators/              # 验证器
│   └── ai.validators.ts    # AI请求验证
├── tests/                   # 测试文件
│   └── ai.trip.service.test.ts # 单元测试
└── index.ts                 # 模块入口
```

### 核心组件

1. **AITripService**: 行程规划AI服务
2. **AIBudgetService**: 预算分析AI服务  
3. **AIVoiceService**: 语音交互AI服务
4. **BailianAIClient**: 百炼API客户端
5. **IflytekAIClient**: 科大讯飞AI客户端

## 安装和使用

### 环境变量配置

在 `.env` 文件中配置以下环境变量：

```bash
# 百炼API配置
BAILIAN_API_KEY=your_bailian_api_key
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 科大讯飞配置
IFLYTEK_APP_ID=your_app_id
IFLYTEK_API_KEY=your_api_key
IFLYTEK_API_SECRET=your_api_secret

# AI服务配置
AI_RATE_LIMIT_PER_MINUTE=60
AI_RATE_LIMIT_PER_HOUR=1000
AI_TRIP_MODEL=qwen-turbo
AI_BUDGET_MODEL=qwen-turbo
AI_VOICE_MODEL=iflytek-speech
```

### 基本使用

```typescript
import { AITripService, AIBudgetService, AIVoiceService } from './modules/ai-services';

// 初始化AI服务
const tripService = new AITripService(aiConfig.bailian);
const budgetService = new AIBudgetService(aiConfig.bailian);
const voiceService = new AIVoiceService(aiConfig.iflytek);

// 使用行程规划服务
const tripPlan = await tripService.generateTripPlan(tripRequest);

// 使用预算分析服务
const budgetAnalysis = await budgetService.analyzeBudgetPatterns(budgetRequest);

// 使用语音服务
const transcription = await voiceService.transcribeSpeech(voiceRequest);
```

## API接口

### 行程规划接口

**POST /api/ai/trip/plan**
- 功能: 生成智能行程规划
- 请求体: TripPlanningRequest
- 响应: TripPlanningResponse

**POST /api/ai/trip/optimize**
- 功能: 优化现有行程路线
- 请求体: { itinerary, optimizationType }
- 响应: 优化后的行程安排

### 预算分析接口

**POST /api/ai/budget/analyze**
- 功能: 分析旅行预算模式
- 请求体: BudgetAnalysisRequest
- 响应: BudgetAnalysisResponse

**POST /api/ai/budget/predict**
- 功能: 预测开销趋势
- 请求体: { historicalData, futurePeriod }
- 响应: 开销预测结果

### 语音服务接口

**POST /api/ai/voice/transcribe**
- 功能: 语音转文本
- 请求体: VoiceRecognitionRequest
- 响应: VoiceRecognitionResponse

**POST /api/ai/voice/generate**
- 功能: 文本转语音
- 请求体: { text, voice }
- 响应: 音频数据

**POST /api/ai/voice/intent**
- 功能: 分析语音意图
- 请求体: { audioData, context }
- 响应: 意图分析结果

### 服务状态接口

**GET /api/ai/status**
- 功能: 获取AI服务状态
- 响应: 各服务健康状态

**GET /api/ai/health**
- 功能: 健康检查
- 响应: 服务健康状态

## 错误处理

模块使用统一的错误处理机制，所有错误都包含以下结构：

```typescript
interface AIError {
  code: string;      // 错误代码
  message: string;   // 错误消息
  details?: any;    // 错误详情
}
```

常见错误代码：
- `VALIDATION_ERROR`: 请求参数验证失败
- `BAILIAN_API_ERROR`: 百炼API调用错误
- `IFLYTEK_API_ERROR`: 科大讯飞API调用错误
- `RESPONSE_PARSE_ERROR`: AI响应解析错误

## 测试

运行单元测试：

```bash
npm test -- ai-services
```

## 开发指南

### 添加新的AI服务

1. 在 `types/ai.types.ts` 中定义相关类型
2. 在 `services/` 目录下创建新的服务类
3. 在 `clients/` 目录下添加对应的AI客户端
4. 在控制器和路由中添加相应的接口
5. 添加单元测试

### 配置管理

所有配置通过环境变量管理，确保敏感信息的安全性。

## 依赖关系

- 依赖模块03（后端核心架构）
- 为模块12（语音识别集成模块）提供AI能力支持
- 为其他业务模块提供AI服务集成

## 版本历史

- v1.0.0: 初始版本，实现基础AI服务集成

## 贡献指南

欢迎提交Issue和Pull Request来改进本模块。