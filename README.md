# AI旅行规划师 (AI Travel Planner)

## 项目简介

AI旅行规划师是一个基于Web的智能旅行规划应用，通过AI技术简化旅行规划过程，提供个性化的旅行路线和建议。

## 核心功能

- 智能行程规划：语音/文字输入，AI自动生成个性化旅行路线
- 费用预算与管理：AI预算分析，语音记录开销
- 用户管理与数据同步：多设备云端同步

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design UI组件库
- 高德地图API
- 科大讯飞语音识别API
- Redux Toolkit + RTK Query

### 后端
- Node.js + Express.js + TypeScript
- 阿里云百炼大语言模型API
- Supabase (PostgreSQL + Auth + Storage)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 项目结构

```
AI-Travel-Planner/
├── frontend/          # 前端项目
├── backend/           # 后端项目
├── docs/             # 项目文档
└── config/           # 配置文件
```

## 开发规范

- 遵循Conventional Commits提交规范
- 使用ESLint + Prettier代码规范
- API密钥通过环境变量管理

## 许可证

MIT License