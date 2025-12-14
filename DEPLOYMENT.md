# MirageAI 部署指南

## 部署前准备

### 1. 环境变量设置
确保在生产环境中设置以下环境变量：

```bash
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

### 2. 部署选项

## 方案一：Vercel（推荐）

### 优点
- ✅ Next.js 官方支持
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 无服务器函数
- ✅ 自动部署（Git集成）
- ✅ 免费额度充足

### 部署步骤

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署应用**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add DASHSCOPE_API_KEY
   ```

5. **自定义域名（可选）**
   在 Vercel 控制台中配置您的域名

## 方案二：Netlify

### 优点
- ✅ 免费额度大
- ✅ 自动HTTPS
- ✅ 表单处理
- ✅ 分支预览

### 部署步骤

1. **构建静态版本**
   ```bash
   npm run build
   ```

2. **上传 .next 文件夹到 Netlify**

3. **设置重定向规则**
   创建 `netlify.toml`：
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

## 方案三：自建服务器（Docker）

### Docker 配置

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **构建并运行**
   ```bash
   docker build -t mirage-ai .
   docker run -p 3000:3000 mirage-ai
   ```

## 方案四：阿里云

### ECS 服务器部署

1. **购买 ECS 实例**
   - 推荐配置：2核4G以上
   - 操作系统：Ubuntu 20.04 LTS

2. **安装环境**
   ```bash
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 安装 PM2
   npm install -g pm2

   # 克隆代码
   git clone <your-repo>
   cd mirage-ai

   # 安装依赖
   npm install

   # 构建应用
   npm run build

   # 使用 PM2 启动
   pm2 start npm --name "mirage-ai" -- start
   ```

3. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

## 重要注意事项

### 1. FFmpeg 依赖
如果使用视频合并功能，需要确保服务器安装了 FFmpeg：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install epel-release
sudo yum install ffmpeg

# macOS
brew install ffmpeg
```

### 2. 安全配置
- 使用环境变量存储 API 密钥
- 启用 HTTPS
- 配置 CORS（如果需要）
- 限制 API 访问频率

### 3. 性能优化
- 启用图片/视频压缩
- 配置 CDN
- 使用 Redis 缓存（可选）
- 监控资源使用

### 4. 监控和日志
- 配置错误监控（如 Sentry）
- 设置日志收集
- 监控 API 调用频率

## 成本估算

### Vercel（推荐）
- Hobby 计划：免费
- Pro 计划：$20/月
- 适合：中小型应用

### 阿里云 ECS
- 2核4G：约 ¥150/月
- 带宽：额外费用
- 适合：需要更多控制的场景

## 推荐方案

对于 MirageAI 应用，我推荐：

1. **开发/测试阶段**：Vercel（免费）
2. **生产环境**：
   - 小规模：Vercel Pro ($20/月)
   - 大规模：阿里云 ECS + SLB

## 部署后检查清单

- [ ] 环境变量正确设置
- [ ] API 密钥有效
- [ ] FFmpeg 已安装（如果使用视频合并）
- [ ] HTTPS 正常工作
- [ ] 视频生成功能测试
- [ ] 文件上传功能测试
- [ ] 错误处理正常
- [ ] 监控配置完成