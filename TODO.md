# Supabase 和 Next.js 最佳实践改进 TODO

## 🔴 高优先级问题

### 1. 优化 proxy.ts 实现 (Next.js 16 推荐使用 proxy.ts 而不是 middleware.ts)

- [ ] 检查并优化 `proxy.ts` 中的 cookie 处理逻辑
- [ ] 确保 cookie 处理符合 Supabase SSR 最佳实践
- [ ] 优化认证检查和重定向逻辑
- [ ] 确保 session 刷新逻辑正确实现

### 2. 修复 lib/fetch.ts 的 token 获取方式

- [x] 移除直接从 localStorage 读取 token 的逻辑
- [x] 使用 Supabase 客户端 (`lib/supabase.ts`) 获取 session
- [x] 从 session 中提取 access_token 用于 API 请求
- [x] 确保在服务器端和客户端都能正确获取 token
- [x] 创建 `lib/fetch-server.ts` 用于服务器端 API 调用
- [x] 创建服务器端服务函数 (`*-server.ts`)

### 3. 修复 lib/supabase.ts 的注释和实现

- [ ] 更正注释: `createBrowserClient` 默认使用 localStorage, 不是 cookies
- [ ] 如果需要使用 cookies, 应该配置 `createBrowserClient` 的 cookie 选项
- [ ] 或者明确说明当前实现使用 localStorage 的原因

### 4. 添加环境变量验证

- [ ] 在 `lib/supabase-server.ts` 中添加运行时环境变量检查
- [ ] 提供清晰的错误信息, 而不是使用 `!` 断言
- [ ] 确保所有 Supabase 客户端创建处都有环境变量验证

## 🟡 中优先级问题

### 5. 重构数据获取为 Server Components

- [ ] 将 `app/resources/virtualization/page.tsx` 改为 Server Component
- [ ] 将 `app/ticket/page.tsx` 改为 Server Component
- [ ] 将 `app/resources/virtualization/[id]/page.tsx` 改为 Server Component
- [ ] 使用 `lib/supabase-server.ts` 的 `createClient()` 在服务器端获取数据
- [ ] 将交互部分提取为独立的 Client Components

### 6. 实现 Server Actions

- [ ] 创建 Server Actions 处理表单提交 (如 profile 更新)
- [ ] 创建 Server Actions 处理数据变更操作 (如删除、更新)
- [ ] 使用 Server Actions 替代客户端直接调用 API

### 7. 完善 next.config.ts 配置

- [ ] 添加 Supabase 相关的 headers 配置
- [ ] 配置必要的 rewrites (如果需要)
- [ ] 添加图片优化配置
- [ ] 配置环境变量相关设置

## 🟢 低优先级优化

### 9. 优化认证流程

- [ ] 检查 `app/auth/callback/page.tsx` 的错误处理
- [ ] 优化认证状态同步逻辑
- [ ] 改进登录后的重定向逻辑

### 10. 代码质量改进

- [ ] 统一错误处理模式
- [ ] 添加类型安全的数据获取函数
- [ ] 优化 loading 和 error 状态的显示
- [ ] 添加适当的错误边界

### 11. 性能优化

- [ ] 实现数据预加载 (prefetching)
- [ ] 优化图片加载
- [ ] 添加适当的缓存策略
- [ ] 减少不必要的客户端 JavaScript

## 📝 参考资源

- [Supabase SSR 文档](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 16 Proxy 文档](https://nextjs.org/docs/app/getting-started/proxy)
- [Next.js App Router 最佳实践](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
