# GitHub Actions 配置指南

## 🔑 配置阿里云容器镜像服务Secrets

### 步骤1：获取阿里云访问凭证

#### 企业版（推荐）
1. **登录阿里云控制台**：https://cr.console.aliyuncs.com/
2. **选择杭州地区实例**：确保选择`cn-hangzhou`地区
3. **获取访问凭证**：
   - 进入"访问凭证"页面
   - 点击"固定访问凭证"
   - 设置Registry密码（如果尚未设置）
   - 获取用户名和密码

#### 个人版
如果您使用的是个人版容器镜像服务：
1. **登录阿里云控制台**：https://cr.console.aliyuncs.com/
2. **进入个人版实例**：选择您的个人版实例
3. **获取访问凭证**：
   - 用户名：您的阿里云账号ID（一串数字）
   - 密码：您设置的Registry固定密码
   - 实例地址：形如`crpi-xxxxxxxxxxxxxxxx.cn-hangzhou.personal.cr.aliyuncs.com`

### 步骤2：在GitHub仓库中配置Secrets

1. **进入GitHub仓库设置**
   - 访问：`https://github.com/maple-shadow/AI-Travel-Planner/settings`

2. **配置Secrets**
   - 左侧菜单选择 "Secrets and variables" > "Actions"
   - 点击 "New repository secret"

3. **添加以下Secrets**：

   | Secret名称                        | 值                     | 说明                     |
   | --------------------------------- | ---------------------- | ------------------------ |
   | `ALIBABA_CLOUD_USERNAME`          | 您的阿里云用户名       | 通常是阿里云账号ID       |
   | `ALIBABA_CLOUD_PASSWORD`          | 您的阿里云密码         | 访问凭证密码             |
   | `ALIBABA_CLOUD_ACCESS_KEY_ID`     | 阿里云AccessKey ID     | `LTAI5t...`              |
   | `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 阿里云AccessKey Secret | `your-access-key-secret` |

### 步骤3：验证配置

1. **推送代码触发构建**
   ```bash
   git add .
   git commit -m "触发GitHub Actions构建"
   git push origin main
   ```

2. **查看构建状态**
   - 进入GitHub仓库的"Actions"标签页
   - 查看"Build and Push Docker Images"工作流状态

## 📋 完整的Secrets配置清单

除了阿里云凭证，您可能还需要配置以下Secrets：

| Secret名称       | 说明              | 是否必需           |
| ---------------- | ----------------- | ------------------ |
| `OPENAI_API_KEY` | OpenAI API密钥    | 可选（用于AI功能） |
| `MONGODB_URI`    | MongoDB连接字符串 | 可选（生产环境）   |
| `JWT_SECRET`     | JWT令牌密钥       | 可选（生产环境）   |

## 🔧 故障排除

### 常见错误及解决方案

1. **"Username and password required"**
   - 确保已正确配置`ALIBABA_CLOUD_USERNAME`和`ALIBABA_CLOUD_PASSWORD`
   - 检查Secrets名称是否与工作流中一致

2. **"unauthorized: authentication required"**
   - 验证阿里云凭证是否正确
   - 检查镜像仓库权限设置

3. **构建失败**
   - 检查Dockerfile语法
   - 验证依赖包是否正确安装

### 测试配置

您可以通过以下方式测试配置：

1. **手动触发工作流**：
   - 在GitHub仓库的Actions页面
   - 选择"Build and Push Docker Images"工作流
   - 点击"Run workflow"

2. **查看构建日志**：
   - 点击运行中的工作流
   - 查看详细日志输出

## 📞 获取帮助

如果遇到问题，可以参考：
- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
- [GitHub Actions文档](https://docs.github.com/en/actions)

## ✅ 成功标志

配置成功后，您应该看到：
- GitHub Actions工作流运行成功
- 镜像成功推送到阿里云容器镜像仓库
- 部署清单自动生成