# 校园二手交易平台

一个功能完整的校园二手交易应用，支持商品发布、实时聊天、订单管理和后台治理。

## 🚀 项目特色

### 四大核心创新点

1. **真机友好的 Socket 自适应连接**
   - 动态 `socketUrl` 适配局域网真机测试
   - 稳定的 `auth` 认证机制
   - 移动端连接成功率显著提升

2. **聊天室幂等创建机制**
   - 多策略查找 + `E11000` 去重回退
   - 避免重复房间与脏数据
   - 保障高并发场景下的一致性

3. **商品治理的"双维度状态模型"**
   - `status`（active/inactive/sold）与 `approvalStatus`（pending/approved/rejected）解耦
   - 运营策略更灵活，审批与上下架清晰可控

4. **统一布局体系保障全屏一致性**
   - `Layout` 组件 + 全局 `index.css` 规范
   - 所有页面在 1920×1080 下统一铺满
   - 提升整体 UX 一致性

## 📱 功能特性

### 用户端功能
- **商品管理**：发布、编辑、下架商品
- **实时聊天**：与卖家/买家即时沟通
- **订单系统**：下单、确认、状态跟踪
- **个人中心**：资料管理、订单历史
- **通知系统**：订单状态变更提醒

### 管理端功能
- **用户管理**：查看、编辑、禁用用户
- **商品管理**：审核、下架、分类管理
- **数据统计**：用户活跃度、商品热度

### 技术特性
- **响应式设计**：完美适配桌面端和移动端
- **实时通信**：基于 Socket.IO 的即时聊天
- **表单验证**：前端即时校验与友好提示
- **状态管理**：React Context 全局状态
- **类型安全**：TypeScript 全栈开发

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Tailwind CSS** 响应式设计
- **React Router** 路由管理
- **Socket.IO Client** 实时通信
- **Vite** 构建工具

### 后端
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Socket.IO** 实时通信
- **JWT** 身份认证
- **Multer** 文件上传

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4

### 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 环境配置

在 `server` 目录下创建 `.env` 文件：

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/campus-marketplace
JWT_SECRET=your-jwt-secret-key
```

### 启动应用

```bash
# 启动后端服务（端口 4000）
cd server
npm run dev

# 启动前端服务（端口 5173）
cd client
npm run dev
```

访问 `http://localhost:5173` 开始使用。

## 📁 项目结构

```
campus-marketplace/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 和 Socket 服务
│   │   ├── contexts/      # React Context
│   │   ├── types/         # TypeScript 类型定义
│   │   └── utils/         # 工具函数
│   └── package.json
├── server/                # 后端 Node.js 应用
│   ├── src/
│   │   ├── models/        # MongoDB 模型
│   │   ├── routes/        # API 路由
│   │   ├── middleware/    # 中间件
│   │   ├── socket/        # Socket.IO 处理
│   │   └── utils/         # 工具函数
│   └── package.json
└── README.md
```

## 🎯 核心功能演示

### 1. 商品发布流程
1. 用户登录后进入"发布商品"
2. 填写商品信息（标题、描述、价格、分类等）
3. 提交后进入"待审核"状态
4. 管理员在后台审核通过后自动上架

### 2. 聊天交易流程
1. 买家在商品详情页点击"联系卖家"
2. 系统自动创建或复用聊天室
3. 双方实时沟通商品详情
4. 买家下单，卖家确认订单
5. 系统发送通知提醒

### 3. 管理后台操作
1. 访问 `/admin` 进入管理后台
2. 用户管理：搜索、编辑、禁用用户
3. 商品管理：审核、下架、状态管理

## 🔧 开发说明

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件采用函数式编程
- 使用 Tailwind CSS 进行样式管理

### 调试技巧
- 前端：浏览器开发者工具 + React DevTools
- 后端：VS Code 调试器 + MongoDB Compass
- 实时通信：Socket.IO 调试面板

### 部署建议
- 前端：Vercel / Netlify
- 后端：Railway / Heroku
- 数据库：MongoDB Atlas

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
1902634965@qq.com

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
