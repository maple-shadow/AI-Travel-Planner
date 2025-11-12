# 后端语音API功能升级文档

## 概述

基于参考的 `voice_backend` 目录实现，对后端语音API调用功能进行了全面升级，新增了实时语音识别功能，支持WebSocket协议进行实时音频流传输和识别结果返回。

## 主要修改内容

### 1. IflytekAIClient 客户端升级

**文件位置**: `src/modules/ai-services/clients/iflytek.client.ts`

#### 新增功能：
- **实时语音识别方法** (`realtimeSpeechToText`): 支持WebSocket方式的实时语音识别
- **WebSocket连接管理**: 自动创建和管理科大讯飞WebSocket连接
- **音频流处理**: 支持异步音频流输入，精确控制发送节奏（40ms/1280字节）
- **鉴权签名**: 实现科大讯飞WebSocket API的HMAC-SHA1签名认证

#### 关键配置：
```typescript
// WebSocket基础URL
private readonly BASE_WS_URL = 'wss://iat-api.xfyun.cn/v2/iat';

// 音频帧配置
private readonly AUDIO_FRAME_SIZE = 1280; // 每帧1280字节
private readonly FRAME_INTERVAL_MS = 40; // 每40ms发送一帧
```

### 2. AIVoiceService 服务层升级

**文件位置**: `src/modules/ai-services/services/ai.voice.service.ts`

#### 新增功能：
- **实时语音识别服务** (`transcribeSpeechRealtime`): 包装客户端实时识别功能
- **结果流处理**: 返回异步生成器，支持实时结果流式返回
- **状态管理**: 实时识别状态跟踪和错误处理

### 3. AIController 控制器升级

**文件位置**: `src/modules/ai-services/controllers/ai.controller.ts`

#### 新增功能：
- **WebSocket端点** (`realtimeSpeechTranscription`): 实时语音识别WebSocket接口
- **音频流生成器**: 从WebSocket消息创建异步音频流
- **消息协议**: 定义客户端-服务端通信协议

### 4. 路由配置升级

**文件位置**: `src/modules/ai-services/routes/ai.routes.ts`

#### 新增路由：
```typescript
// 实时语音识别WebSocket路由
this.router.ws('/voice/realtime', this.aiController.realtimeSpeechTranscription);
```

### 5. 类型定义扩展

**文件位置**: `src/modules/ai-services/types/ai.types.ts`

#### 新增类型：
- `RealtimeTranscriptionResult`: 实时识别结果类型
- `WebSocketMessage`: WebSocket消息类型定义

### 6. 应用配置升级

**文件位置**: `src/core/app/index.ts`

#### WebSocket支持：
- 集成 `express-ws` 中间件
- 启用WebSocket路由支持

### 7. 依赖包更新

**文件位置**: `package.json`

#### 新增依赖：
- `ws`: WebSocket客户端/服务器实现
- `express-ws`: Express WebSocket中间件
- `@types/ws`: TypeScript类型定义

## API接口说明

### 实时语音识别 WebSocket API

**端点**: `ws://localhost:3000/api/ai/voice/realtime`

#### 客户端发送消息格式：

1. **音频数据消息**:
```json
{
  "type": "audio",
  "data": "base64编码的音频数据"
}
```

2. **结束标记消息**:
```json
{
  "type": "end"
}
```

#### 服务端返回消息格式：

1. **识别结果消息**:
```json
{
  "type": "transcription",
  "data": {
    "text": "识别文本",
    "confidence": 0.9,
    "isFinal": false,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

2. **完成消息**:
```json
{
  "type": "complete",
  "data": {
    "message": "语音识别完成"
  }
}
```

3. **错误消息**:
```json
{
  "type": "error",
  "data": {
    "error": "错误描述"
  }
}
```

### 传统REST API（保持兼容）

**端点**: `POST /api/ai/voice/transcribe`

**请求体**:
```json
{
  "audioData": "base64编码的音频数据",
  "audioFormat": "wav",
  "language": "zh_cn"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "text": "识别文本",
    "confidence": 0.9,
    "language": "zh_cn",
    "duration": 5
  }
}
```

## 技术特性

### 1. 实时性能优化
- **精确时序控制**: 40ms帧间隔，确保音频流连续性
- **异步流处理**: 使用AsyncIterable实现高效内存管理
- **并发处理**: 音频发送和结果接收并行执行

### 2. 协议兼容性
- **科大讯飞协议**: 完全兼容科大讯飞实时语音识别API
- **WebSocket标准**: 使用标准WebSocket协议
- **REST兼容**: 保持原有REST API接口不变

### 3. 错误处理
- **连接重试**: WebSocket连接失败自动重试
- **超时控制**: 10秒连接超时保护
- **错误分类**: 区分网络错误、API错误、协议错误

### 4. 安全性
- **HMAC签名**: 请求参数HMAC-SHA1签名验证
- **参数验证**: 完整的输入参数验证
- **访问控制**: 集成现有认证中间件

## 部署和测试

### 安装依赖
```bash
cd backend
npm install
```

### 启动服务
```bash
npm run dev
```

### 测试API
```bash
# 运行测试脚本
node test-voice-api.js
```

## 前端集成建议

### WebSocket客户端实现
```typescript
// 创建WebSocket连接
const ws = new WebSocket('ws://localhost:3000/api/ai/voice/realtime');

// 发送音频数据
ws.send(JSON.stringify({
  type: 'audio',
  data: base64AudioData
}));

// 接收识别结果
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'transcription') {
    console.log('识别结果:', message.data.text);
  }
};
```

### 音频录制要求
- **采样率**: 16kHz
- **格式**: PCM 16-bit little-endian
- **帧大小**: 1280字节/40ms

## 性能指标

- **延迟**: < 200ms（端到端识别延迟）
- **并发**: 支持多用户同时识别
- **稳定性**: 自动重连和错误恢复
- **资源**: 低内存占用，高效流处理

## 故障排除

### 常见问题

1. **WebSocket连接失败**
   - 检查服务是否正常启动
   - 验证端口3000是否被占用
   - 检查防火墙设置

2. **音频识别失败**
   - 验证音频格式和采样率
   - 检查科大讯飞API密钥配置
   - 查看服务日志获取详细错误信息

3. **性能问题**
   - 检查网络带宽
   - 验证服务器资源使用情况
   - 调整音频帧大小和间隔

### 日志查看
```bash
# 查看服务日志
tail -f logs/app.log
```

## 后续优化方向

1. **性能优化**
   - 实现音频流压缩
   - 添加负载均衡
   - 优化WebSocket连接池

2. **功能扩展**
   - 支持多语言识别
   - 添加语音合成实时反馈
   - 实现语音命令识别

3. **监控告警**
   - 添加性能监控
   - 实现健康检查
   - 设置告警阈值

---

**文档版本**: 1.0  
**最后更新**: 2024年  
**维护团队**: AI旅行规划师开发团队