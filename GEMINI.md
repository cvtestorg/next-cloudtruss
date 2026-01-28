# CloudTruss (Next.js Portal)

CloudTruss 是一个基于 Next.js 开发的基础架构服务目录门户。它提供了虚拟机管理、资源管理、工单系统等功能，旨在为用户提供一个统一的云资源管理界面。

## 项目概述

- **核心技术栈**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4。
- **UI 组件**: Radix UI, shadcn/ui 风格组件, Lucide 图标, Framer Motion 动画。
- **状态管理**: Zustand。
- **表单校验**: React Hook Form + Zod。
- **认证**: NextAuth.js v5 (Auth.js) 集成 Keycloak。
- **授权**: OpenFGA (Fine-Grained Authorization) 细粒度权限控制。
- **数据获取**: 封装了 `serverApi` 用于服务端请求外部 API。

## 目录结构

- `app/`: Next.js 路由和页面。`(auth)` 处理登录流程，`(portal)` 为主要业务门户。
- `actions/`: 服务端操作 (Server Actions)，按业务领域划分（vm, user, project, ticket 等）。
- `components/`:
    - `ui/`: 基础 UI 组件（shadcn/ui）。
    - `sidebar/`: 侧边栏相关组件。
    - `theme/`: 主题切换相关。
- `config/`: 静态配置（菜单项、路由权限、站点元数据）。
- `lib/`: 核心库封装（Auth, OpenFGA, Fetch 包装器, 日志）。
- `schemas/`: Zod 校验模式。
- `services/`: 业务服务逻辑。
- `types/`: 全局 TypeScript 类型定义。
- `public/themes/`: 预定义的主题 CSS 变量。

## 运行与开发

### 依赖安装
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建与生产运行
```bash
pnpm build
pnpm start
```

### 代码检查
```bash
pnpm lint
```

## 开发约定

- **Server Actions**: 所有的服务端逻辑（如调用后端 API、权限检查）应放在 `actions/` 目录中，并使用 `"use server"` 标识。
- **类型安全**: 强制使用 TypeScript，所有外部 API 返回值应在 `types/` 中定义接口。
- **数据验证**: 表单提交和 Action 参数应使用 `schemas/` 中的 Zod Schema 进行验证。
- **权限控制**: 敏感操作应通过 `lib/openfga.ts` 进行权限校验。
- **UI 开发**: 优先使用 `components/ui` 中的原子组件构建界面，遵循 Tailwind CSS 4 的原子类规范。
- **环境变量**: 
    - 认证相关: `AUTH_SECRET`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ISSUER`。
    - 权限相关: `FGA_API_URL`, `FGA_STORE_ID`, `FGA_MODEL_ID`, `FGA_API_TOKEN`。

## 核心配置

- 站点配置: `config/site.ts`
- 菜单配置: `config/menu.ts`
- 权限定义: `config/permissions.ts`
- 主题配置: `config/themes.ts`
