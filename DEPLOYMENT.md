# AI旅行规划助手 - 部署指南

## 本地开发环境

### 使用Docker Compose（推荐）

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑`.env`文件，配置必要的环境变量：
```bash
# 设置OpenAI API密钥
OPENAI_API_KEY=your-openai-api-key-here

# 设置阿里云访问密钥（用于语音识别）
ALIBABA_CLOUD_ACCESS_KEY_ID=your-access-key-id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your-access-key-secret
```

3. 启动所有服务：
```bash
docker-compose up -d
```

4. 访问应用：
   - 前端应用：http://localhost
   - 后端API：http://localhost:3000
   - MongoDB：localhost:27017
   - Redis：localhost:6379

### 手动启动（不使用Docker）

#### 启动后端服务
```bash
cd backend
npm install
npm run dev
```

#### 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

## 生产环境部署

### 使用GitHub Actions自动构建

1. 在GitHub仓库中设置以下Secrets：
   - `ALIBABA_CLOUD_USERNAME`: 阿里云容器镜像仓库用户名
   - `ALIBABA_CLOUD_PASSWORD`: 阿里云容器镜像仓库密码

2. 推送代码到main分支时，GitHub Actions会自动：
   - 构建后端Docker镜像
   - 构建前端Docker镜像
   - 推送镜像到阿里云容器镜像仓库

### 手动构建Docker镜像

#### 构建后端镜像
```bash
cd backend
docker build -t your-registry/ai-travel-planner-backend:latest .
```

#### 构建前端镜像
```bash
cd frontend
docker build -t your-registry/ai-travel-planner-frontend:latest .
```

#### 推送镜像到阿里云
```bash
# 登录阿里云容器镜像服务
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 标记镜像
docker tag your-registry/ai-travel-planner-backend:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-backend:latest
docker tag your-registry/ai-travel-planner-frontend:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-frontend:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-backend:latest
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-frontend:latest
```

## 服务器部署

### 使用Docker Compose部署

1. 在服务器上创建部署目录：
```bash
mkdir -p /opt/ai-travel-planner
cd /opt/ai-travel-planner
```

2. 创建`docker-compose.prod.yml`文件：
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-secure-password
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  backend:
    image: registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-backend:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/ai_travel_planner?authSource=admin
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    image: registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-frontend:latest
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
```

3. 启动服务：
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 环境变量配置

### 必需的环境变量

- `OPENAI_API_KEY`: OpenAI API密钥
- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT令牌密钥

### 可选的环境变量

- `ALIBABA_CLOUD_ACCESS_KEY_ID`: 阿里云访问密钥ID（用于语音识别）
- `ALIBABA_CLOUD_ACCESS_KEY_SECRET`: 阿里云访问密钥（用于语音识别）
- `REDIS_URL`: Redis连接URL（用于缓存）

## 监控和日志

### 查看容器日志
```bash
# 查看所有容器日志
docker-compose logs

# 查看特定容器日志
docker-compose logs backend
docker-compose logs frontend
```

### 健康检查
应用提供健康检查端点：
- 后端健康检查：`GET http://localhost:3000/health`
- 前端健康检查：访问首页查看状态

## 故障排除

### 常见问题

1. **端口冲突**：确保3000和80端口未被占用
2. **数据库连接失败**：检查MongoDB服务是否正常运行
3. **镜像构建失败**：检查网络连接和Docker配置
4. **API调用失败**：验证OpenAI API密钥是否正确配置

### 重启服务
```bash
docker-compose restart
```

### 更新服务
```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d
```