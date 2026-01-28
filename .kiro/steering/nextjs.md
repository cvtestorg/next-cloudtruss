---
inclusion: always
---

# Next.js 15/16 开发最佳实践

## 1. Server Components 优先原则

### 1.1 默认使用 Server Components
- **默认所有组件都是 Server Components**, 无需添加 `'use client'` 指令
- Server Components 的优势:
  - 减少客户端 JavaScript 体积
  - 直接访问服务器资源(数据库、API keys 等)
  - 提升首屏渲染性能(FCP)
  - 增强安全性(敏感信息不会暴露到客户端)

### 1.2 何时使用 Client Components
仅在以下场景使用 `'use client'`:
- 需要交互性: `onClick`, `onChange` 等事件处理
- 使用 React Hooks: `useState`, `useEffect`, `useContext` 等
- 访问浏览器 API: `window`, `localStorage`, `navigator` 等
- 使用第三方库需要客户端交互

### 1.3 组件组合模式
```typescript
// Server Component - 数据获取
import LikeButton from '@/components/LikeButton';
import { getPost } from '@/lib/data';

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  
  return (
    <div>
      <h1>{post.title}</h1>
      {/* Client Component 嵌套在 Server Component 中 */}
      <LikeButton initialLikes={post.likes} />
    </div>
  );
}
```

### 1.4 代码组织
- Server Actions 应放在独立的模块或目录中, 与 Client Components 分离
- 保持 Server 和 Client Components 的清晰边界

## 2. 数据获取策略

### 2.1 优先在 Server Components 中获取数据
- 直接在 Server Components 中使用 `fetch` 或数据库查询
- 避免通过 props 层层传递数据, 在需要的组件中直接获取
- Next.js 会自动对相同的 `fetch` 请求进行去重和优化

### 2.2 并行数据获取
使用 `Promise.all` 避免请求瀑布:
```typescript
export default async function DashboardPage() {
  const [users, analytics, notifications] = await Promise.all([
    fetchUsers(),
    fetchAnalytics(),
    fetchNotifications()
  ]);
  
  return <Dashboard data={{ users, analytics, notifications }} />;
}
```

### 2.3 缓存策略
- **静态数据**: 使用默认缓存行为
- **动态数据**: 使用 `{ cache: 'no-store' }` 确保每次请求都获取最新数据
- **时间重新验证**: 使用 `{ next: { revalidate: 3600 } }` 设置缓存过期时间
- **按需重新验证**: 使用 `revalidateTag` 或 `revalidatePath` 手动刷新缓存

```typescript
// 时间重新验证
const data = await fetch('/api/data', {
  next: { revalidate: 3600 } // 1小时后重新验证
});

// 按需重新验证
import { revalidateTag } from 'next/cache';
revalidateTag('categories-data');
```

### 2.4 Streaming 和 Suspense
- 使用 `loading.js` 文件自动处理加载状态
- 使用 `<Suspense>` 边界实现渐进式渲染
- 将页面拆分为多个 Suspense 边界, 提升用户体验

```typescript
export default function ProductPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>
    </>
  );
}
```

## 3. Server Actions 最佳实践

### 3.1 使用场景
- **仅用于数据变更**: 创建、更新、删除操作
- **不用于数据获取**: 数据获取应使用 Server Components 或 Route Handlers

### 3.2 输入验证
- 始终在服务器端验证用户输入
- 使用 Zod 或 Joi 等库定义验证模式
- 客户端和服务端都要验证

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
  };
  
  const validated = schema.parse(data);
  // 处理数据...
}
```

### 3.3 错误处理
- 使用 `try...catch` 处理异常
- 提供有意义的错误反馈
- 使用 `revalidatePath` 或 `revalidateTag` 更新缓存

### 3.4 安全性
- 在 Server Actions 中实现身份验证和授权检查
- 确保只有授权用户才能执行特定操作
- 保持 Server Actions 轻量级, 避免复杂逻辑

### 3.5 渐进式增强
- 设计表单使其在没有 JavaScript 的情况下也能正常工作
- 使用标准表单提交方式

## 4. Route Handlers (API Routes)

### 4.1 组织结构
- 在 `/app/api/` 目录下组织 API 路由
- 将相关端点分组到子目录中

### 4.2 HTTP 方法处理
- 为必要的 HTTP 方法定义处理器(`GET`, `POST`, `PUT`, `DELETE` 等)
- 对不支持的方法返回 `405 Method Not Allowed`

```typescript
export async function GET(request: Request) {
  return Response.json({ data: '...' });
}

export async function POST(request: Request) {
  const body = await request.json();
  // 处理数据...
  return Response.json({ success: true });
}
```

### 4.3 输入验证和清理
- 使用 Zod 或 Yup 验证和清理输入
- 永远不要信任传入的数据

### 4.4 性能优化
- 对 `GET` 请求实现缓存策略
- 使用 `export const dynamic = 'force-static'` 启用静态缓存

### 4.5 安全性
- 实现身份验证和授权机制
- 使用中间件验证 token 或 session
- 保护敏感端点

## 5. 错误处理和加载状态

### 5.1 Loading States
- 创建 `loading.js` 文件显示加载指示器
- 使用骨架屏提升用户体验

```typescript
// app/posts/loading.js
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* 骨架屏内容 */}
    </div>
  );
}
```

### 5.2 Error Boundaries
- 创建 `error.js` 文件处理错误
- Error Components 必须是 Client Components
- 提供重试机制

```typescript
// app/posts/error.js
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## 6. SEO 和 Metadata 优化

### 6.1 静态 Metadata
```typescript
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};
```

### 6.2 动态 Metadata
```typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.summary,
  };
}
```

### 6.3 结构化数据
- 使用 JSON-LD 实现结构化数据
- 添加 Open Graph 和 Twitter Card 标签
- 定义 canonical URLs

### 6.4 最佳实践
- 每个页面都有唯一且描述性的 title 和 description
- 生成并维护最新的 sitemap 和 robots.txt

## 7. 性能优化

### 7.1 代码分割
- Next.js 自动进行页面级代码分割
- 使用 `next/dynamic` 进行组件级代码分割
- 对大型组件或非立即需要的功能使用动态导入

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // 仅在客户端渲染
});
```

### 7.2 Tree Shaking
- 使用 ES Modules (ESM) 语法
- 避免在模块中使用副作用
- 编写纯净的模块化代码

### 7.3 图片优化
- 使用 `next/image` 组件自动优化图片
- 图片会自动转换为 WebP 和 AVIF 格式
- 自动调整尺寸和懒加载

### 7.4 字体优化
- 优先使用系统字体
- 使用 `font-display: swap`
- 使用 `<link rel="preload">` 预加载关键字体

### 7.5 构建优化 (Next.js 16)
- 使用 Turbopack 作为默认打包工具(Next.js 16)
- 启用 `turbopackFileSystemCacheForDev` 用于大型项目
- 使用 React Compiler 自动记忆化

## 8. TypeScript 最佳实践

### 8.1 严格模式
- 在 `tsconfig.json` 中启用 `"strict": true`

### 8.2 类型定义
- 为组件 props 和 state 定义明确的接口
- 利用类型推断减少样板代码
- 使用 TypeScript 工具类型(`Partial`, `Required`, `Pick`, `Omit` 等)

### 8.3 避免使用 `any`
- 避免使用 `any` 类型
- 使用更具体的类型或泛型

### 8.4 类型化路由
- 启用 `experimental.typedRoutes` 防止路由拼写错误

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
};
```

### 8.5 第三方库类型
- 为没有类型定义的第三方库创建 `*.d.ts` 声明文件

## 9. 安全性最佳实践

### 9.1 数据安全
- 敏感数据(API keys, tokens)仅在服务器端使用
- 在 Server Components 或 Server Actions 中处理敏感操作
- 永远不要在 Client Components 中暴露敏感信息

### 9.2 输入验证
- 始终验证和清理用户输入
- 使用验证库(Zod, Joi)确保数据完整性

### 9.3 身份验证和授权
- 在 Server Actions 和 Route Handlers 中实现身份验证
- 使用中间件保护路由
- 验证用户权限

## 10. 代码组织

### 10.1 目录结构
- 采用模块化目录结构
- 将 Server Actions 放在独立模块中
- 保持 Server 和 Client Components 的清晰分离

### 10.2 关注点分离
- 每个 Route Handler 专注于单一职责
- 避免在单个处理器中放置过多逻辑
- 创建辅助函数或模块封装复杂逻辑

## 11. 开发工作流

### 11.1 性能监控
- 使用 Lighthouse, Web Vitals, Next.js Analytics 监控性能
- 定期分析 bundle 大小
- 使用 `@next/bundle-analyzer` 可视化 bundle

### 11.2 代码质量
- 使用 ESLint 和 Prettier
- 配置 TypeScript 严格模式
- 定期审查代码

## 12. 核心原则总结

1. **Server Components 优先**: 默认使用 Server Components, 仅在需要交互时使用 Client Components
2. **数据获取在服务器**: 在 Server Components 中直接获取数据, 避免客户端请求
3. **并行获取数据**: 使用 `Promise.all` 避免请求瀑布
4. **合理使用缓存**: 根据数据特性选择合适的缓存策略
5. **Streaming 提升体验**: 使用 Suspense 和 loading.js 实现渐进式渲染
6. **Server Actions 用于变更**: 仅用于数据变更, 不用于数据获取
7. **类型安全**: 充分利用 TypeScript 确保类型安全
8. **性能优先**: 代码分割、图片优化、字体优化
9. **安全性**: 敏感操作在服务器端, 验证所有输入
10. **代码组织**: 清晰的目录结构和关注点分离
