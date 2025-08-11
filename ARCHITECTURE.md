# n8n 中文社区 - 项目架构说明

## 项目概述

n8n 中文社区是一个基于 Start UI 框架构建的全栈 Web 应用，专门为中文用户提供 n8n 自动化工作流资源与交流平台。该项目采用现代化的前端技术栈，支持多语言、用户认证、工作流管理和社区互动功能。

## 技术栈

### 前端核心
- **Next.js 14.2.4** - React 全栈框架，支持 SSR/SSG
- **React 18.3.1** - 用户界面构建库
- **TypeScript 5.5.3** - 类型安全的 JavaScript 超集
- **Chakra UI 2.8.2** - React 组件库和主题系统
- **Emotion** - CSS-in-JS 样式解决方案

### 状态管理与数据
- **tRPC 10.45.2** - 类型安全的 API 框架
- **TanStack Query 4.36.1** - 服务端状态管理
- **Zustand 4.5.4** - 客户端状态管理
- **Prisma 5.16.2** - 数据库 ORM
- **Zod 3.23.8** - 类型安全的模式验证

### 开发与测试
- **Storybook** - 组件开发与文档
- **Playwright** - 端到端测试
- **Vitest** - 单元测试
- **ESLint & Prettier** - 代码质量与格式化

### 其他重要依赖
- **React Hook Form** - 表单处理
- **React i18next** - 国际化支持
- **React Email** - 邮件模板
- **Framer Motion** - 动画效果
- **ReactFlow** - 工作流可视化

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── (public-only)/     # 公开访问页面（登录/注册）
│   ├── admin/             # 管理后台页面
│   ├── api/               # API 路由
│   └── app/               # 应用主页面（需认证）
├── components/            # 可复用组件库
│   ├── Form/             # 表单组件
│   ├── Icons/            # 图标组件
│   └── ...               # 其他 UI 组件
├── features/             # 功能模块
│   ├── auth/             # 认证功能
│   ├── account/          # 账户管理
│   ├── workflows/        # 工作流管理
│   ├── repositories/     # 仓库管理
│   ├── users/            # 用户管理
│   └── ...               # 其他功能模块
├── server/               # 服务端逻辑
│   ├── config/           # 服务器配置
│   ├── routers/          # tRPC 路由
│   └── router.ts         # 主路由聚合
├── lib/                  # 工具库
│   ├── trpc/             # tRPC 客户端配置
│   ├── i18n/             # 国际化配置
│   └── utils.ts          # 通用工具函数
├── theme/                # 主题系统
│   ├── components/       # 组件主题
│   ├── foundations/      # 基础设计系统
│   └── config.ts         # 主题配置
├── locales/              # 多语言文件
│   ├── en/               # 英文
│   ├── zh/               # 中文
│   └── ...               # 其他语言
├── emails/               # 邮件模板
└── types/                # TypeScript 类型定义
```

## 核心功能模块

### 1. 认证系统 (auth)
- **文件位置**: `src/features/auth/`
- **功能**: 用户注册、登录、OAuth 集成、邮箱验证
- **技术**: 自定义认证实现、支持 GitHub/Google OAuth
- **路由**: `/login`, `/register`, `/oauth/[provider]`

### 2. 用户管理 (users)
- **文件位置**: `src/features/users/`
- **功能**: 用户信息管理、角色权限控制
- **数据模型**: User, AccountStatus, UserRole
- **管理界面**: 用户列表、创建、编辑、删除

### 3. 工作流管理 (workflows)
- **文件位置**: `src/features/workflows/`
- **功能**: n8n 工作流模板管理、分类、复杂度评级
- **数据模型**: Workflow, WorkflowLike, WorkflowTag
- **特色功能**:
  - 工作流分类（内容自动化、社交媒体、数据处理等）
  - 复杂度评级（简单、中等、高级、商业级）
  - 触发类型分类（定时、Webhook、手动等）
  - 点赞和下载统计

### 4. 仓库管理 (repositories)
- **文件位置**: `src/features/repositories/`
- **功能**: 代码仓库管理、工作流存储
- **数据模型**: Repository
- **功能**: 仓库创建、编辑、展示

### 5. 管理后台 (admin)
- **文件位置**: `src/features/admin*/`
- **功能**: 后台管理系统
- **模块**: 用户管理、仓库管理、工作流管理、系统配置
- **权限**: 基于 UserRole 的访问控制

## 数据库架构

### 核心实体关系
```
User (用户)
├── Workflow (工作流)
│   ├── WorkflowLike (点赞)
│   └── WorkflowTag (标签)
├── Repository (仓库)
└── Session (会话)
```

### 主要数据模型
- **User**: 用户信息、角色、状态
- **Workflow**: 工作流模板、分类、统计
- **WorkflowLike**: 用户对工作流的点赞
- **WorkflowTag**: 工作流标签系统
- **Repository**: 代码仓库信息
- **OAuthAccount**: 第三方登录账户

## API 架构

### tRPC 路由结构
```typescript
appRouter = {
  auth: authRouter,      // 认证相关
  account: accountRouter, // 账户管理
  users: usersRouter,    // 用户管理
  workflows: workflowsRouter, // 工作流管理
  repositories: repositoriesRouter, // 仓库管理
  oauth: oauthRouter,    // OAuth 集成
}
```

### API 特性
- **类型安全**: 基于 TypeScript 的完整类型推断
- **自动文档**: 支持 OpenAPI 规范生成
- **错误处理**: 统一的错误处理机制
- **性能优化**: 请求批处理和缓存

## 前端架构

### 组件设计
- **原子设计**: 基于 Chakra UI 的设计系统
- **可复用性**: 通用组件库支持多项目复用
- **类型安全**: 组件 Props 完整类型定义
- **主题化**: 支持明暗主题切换

### 状态管理
- **服务端状态**: TanStack Query 管理服务端数据
- **客户端状态**: Zustand 管理本地状态
- **表单状态**: React Hook Form 管理表单状态
- **全局状态**: 通过 Context API 管理应用状态

### 页面路由
- **Next.js App Router**: 使用最新的 App Router 架构
- **路由保护**: 基于认证状态的路由守卫
- **布局系统**: 共享布局和嵌套路由支持
- **SEO 优化**: 支持服务端渲染和静态生成

## 国际化 (i18n)

### 支持语言
- **中文 (zh)**: 主要语言
- **英文 (en)**: 默认语言
- **其他**: 阿拉伯语、法语、瑞典语

### 特性
- **动态语言切换**: 运行时切换语言
- **命名空间**: 按功能模块组织翻译文件
- **类型安全**: 翻译键的类型检查
- **RTL 支持**: 支持从右到左的语言

## 部署与开发

### 开发环境
```bash
# 安装依赖
pnpm install

# 启动数据库
pnpm dk:init

# 开发服务器
pnpm dev
```

### 生产环境
```bash
# 构建项目
pnpm build

# 启动服务
pnpm start
```

### Docker 支持
- **Dockerfile**: 应用容器化配置
- **docker-compose.yml**: 数据库和服务编排
- **环境变量**: 支持容器化部署

## 安全特性

### 认证与授权
- **JWT Session**: 基于 JWT 的会话管理
- **密码加密**: bcrypt 密码哈希
- **OAuth 2.0**: 支持第三方登录
- **角色权限**: 基于角色的访问控制

### 数据安全
- **输入验证**: Zod 模式验证
- **CSRF 保护**: 内置 CSRF 防护
- **XSS 防护**: 自动 XSS 过滤
- **SQL 注入**: Prisma ORM 自动防护

## 性能优化

### 前端优化
- **代码分割**: 自动代码分割和懒加载
- **图片优化**: Next.js 图片优化
- **缓存策略**: 智能缓存控制
- **PWA 支持**: 渐进式 Web 应用特性

### 后端优化
- **数据库索引**: 关键字段索引优化
- **查询优化**: Prisma 查询优化
- **API 缓存**: 响应缓存机制
- **静态资源**: CDN 支持

## 测试策略

### 测试框架
- **E2E 测试**: Playwright 端到端测试
- **单元测试**: Vitest 单元测试框架
- **组件测试**: React Testing Library
- **测试覆盖率**: 完整的测试覆盖率报告

### 测试文件结构
```
e2e/                    # 端到端测试
├── login.spec.ts       # 登录流程测试
├── register.spec.ts    # 注册流程测试
└── ...                # 其他 E2E 测试

src/tests/              # 单元测试工具
├── setup.ts           # 测试配置
└── utils.tsx          # 测试工具函数
```

## 监控与日志

### 日志系统
- **Pino**: 高性能日志库
- **日志级别**: 支持多级别日志记录
- **结构化日志**: JSON 格式日志输出
- **环境区分**: 开发/生产环境日志配置

### 错误监控
- **错误边界**: React 错误边界组件
- **全局错误处理**: 统一的错误处理机制
- **用户反馈**: 错误报告和用户反馈收集

## 扩展性设计

### 插件系统
- **模块化架构**: 功能模块独立开发
- **主题系统**: 可扩展的设计系统
- **组件库**: 可复用的组件库设计

### API 扩展
- **tRPC 插件**: 支持 tRPC 插件扩展
- **中间件**: 自定义中间件支持
- **数据源**: 支持多种数据源集成

## 总结

n8n 中文社区项目采用现代化的全栈架构，具有以下特点：

1. **技术先进**: 使用最新的 React 生态技术栈
2. **类型安全**: 全面的 TypeScript 类型覆盖
3. **用户体验**: 响应式设计、多语言支持
4. **开发效率**: 完整的开发工具链和脚手架
5. **可维护性**: 清晰的代码结构和模块化设计
6. **可扩展性**: 良好的扩展性和插件化架构

该项目为 n8n 中文用户提供了完整的工作流管理和社区交流平台，是一个技术先进、功能完善的现代化 Web 应用。