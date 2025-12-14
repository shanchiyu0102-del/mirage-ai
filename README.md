# MirageAI - AI视频生成平台

基于AI的故事视频生成平台，让创意变为生动视频。

## 功能特点

- 📝 **智能故事创作**：输入故事梗概，AI自动生成分镜头脚本
- 🎨 **多样风格选择**：支持赛博朋克、皮克斯、恐怖、写实、国风、动漫等风格
- 🎬 **分镜头编辑**：可编辑调整每个分镜头的描述
- 🎭 **角色一致性**：自动生成并保持角色形象的一致性
- 📹 **视频生成**：基于分镜头脚本生成角色一致的动画视频
- 📱 **响应式设计**：完美适配移动端和桌面端
- ✨ **苹果液态玻璃风格**：现代化的UI设计

## 技术栈

- **前端框架**：Next.js 15 + React 19
- **样式框架**：Tailwind CSS
- **AI模型**：
  - qwen3-max：故事梗概改写和分镜头生成
  - wan2.5-t2i-preview：主角图片生成
  - wan2.5-i2v-preview：视频生成

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

1. 克隆项目
```bash
git clone [repository-url]
cd mirage-ai
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 DashScope API Key
```

4. 启动开发服务器
```bash
npm run dev
```

5. 访问 [http://localhost:3000](http://localhost:3000)

## 使用流程

1. **故事输入**：在第一页输入故事梗概，选择视频参数和风格
2. **分镜头编辑**：查看并编辑AI生成的4个分镜头脚本
3. **视频预览**：预览生成的4个分镜头视频片段
4. **完成下载**：查看合并后的最终视频并下载

## API配置

项目使用阿里云DashScope API，需要：

1. 获取API Key：[DashScope控制台](https://dashscope.console.aliyun.com/)
2. 在`.env.local`文件中配置：
```
DASHSCOPE_API_KEY=your_api_key_here
```

## 项目结构

```
src/
├── app/                 # Next.js App Router
├── components/          # React组件
│   ├── Navigation.tsx   # 导航栏组件
│   ├── StoryPage.tsx    # 故事输入页面
│   ├── EditPage.tsx     # 分镜头编辑页面
│   ├── PreviewPage.tsx  # 视频预览页面
│   └── FinalPage.tsx    # 最终展示页面
├── lib/                # 工具函数和API调用
└── types/              # TypeScript类型定义
```

## 注意事项

- API调用需要时间，请耐心等待
- 视频生成过程较长，预计每个镜头需要2-5分钟
- 生成的视频和图片链接有效期为24小时
- 建议及时下载生成的视频

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产服务器
npm run lint       # 运行ESLint检查
```

## 许可证

MIT License