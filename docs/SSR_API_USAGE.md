# 服务器端 SSR API 调用使用指南

## 概述

项目现在支持在服务器端（Server Components、Server Actions）和客户端（Client Components）调用后端 Python API，并自动传递 Supabase 的 `access_token`。

## 架构说明

### 客户端 API (`lib/fetch.ts`)
- 用于 Client Components
- 从 Supabase 客户端 session 中获取 `access_token`
- 自动添加到请求头的 `Authorization: Bearer <token>`

### 服务器端 API (`lib/fetch-server.ts`)
- 用于 Server Components、Server Actions、Route Handlers
- 从 Supabase 服务器端 session（cookies）中获取 `access_token`
- 自动添加到请求头的 `Authorization: Bearer <token>`

## 使用方法

### 在 Server Component 中使用

```typescript
// app/resources/virtualization/page.tsx
import { getVirtualMachinesServer } from "@/services/vm-server";

export default async function VirtualMachineListPage() {
  // 服务器端获取数据，自动传递 access_token
  const data = await getVirtualMachinesServer(1, 20);
  
  return (
    <div>
      {/* 渲染数据 */}
    </div>
  );
}
```

### 在 Server Action 中使用

```typescript
// app/actions/ticket-actions.ts
"use server";

import { createTicketServer } from "@/services/ticket-server";

export async function createTicketAction(formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    // ... 其他字段
  };
  
  // 服务器端创建工单，自动传递 access_token
  const result = await createTicketServer(data);
  return result;
}
```

### 在 Client Component 中使用（现有方式）

```typescript
// app/resources/virtualization/page.tsx (Client Component)
"use client";

import { getVirtualMachines } from "@/services/vm";
import { useEffect, useState } from "react";

export default function VirtualMachineList() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // 客户端获取数据，自动传递 access_token
    getVirtualMachines(1, 20).then(setData);
  }, []);
  
  return <div>{/* 渲染数据 */}</div>;
}
```

## Token 获取流程

### 客户端流程
1. 用户登录后，Supabase 将 session 存储在浏览器中
2. `lib/fetch.ts` 调用 `supabase.auth.getSession()` 获取 session
3. 从 session 中提取 `access_token`
4. 将 token 添加到请求头：`Authorization: Bearer <access_token>`

### 服务器端流程
1. 用户登录后，Supabase 将 session 存储在 cookies 中
2. `lib/fetch-server.ts` 调用 `getServerAccessToken()` 获取 token
3. `getServerAccessToken()` 使用 `createClient()` 从 cookies 中读取 session
4. 从 session 中提取 `access_token`
5. 将 token 添加到请求头：`Authorization: Bearer <access_token>`

## 后端 Python API 验证

后端需要验证 Supabase JWT token。示例代码：

```python
from fastapi import HTTPException, Depends, Header
import jwt
from supabase import create_client, Client

SUPABASE_URL = "your-supabase-url"
SUPABASE_JWT_SECRET = "your-supabase-jwt-secret"

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        # 方式 1: 使用 Supabase Python SDK 验证
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_JWT_SECRET)
        user = supabase.auth.get_user(token)
        return user
        
        # 方式 2: 手动验证 JWT
        # decoded = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        # return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.get("/api/vm")
async def get_vms(user = Depends(verify_token)):
    # user 对象包含用户信息
    return {"data": "your data"}
```

## 文件结构

```
lib/
  ├── fetch.ts              # 客户端 API 调用
  ├── fetch-server.ts        # 服务器端 API 调用
  └── supabase-server.ts     # 服务器端 Supabase 客户端和 token 获取

services/
  ├── vm.ts                  # 客户端虚拟机服务
  ├── vm-server.ts           # 服务器端虚拟机服务
  ├── ticket.ts              # 客户端工单服务
  ├── ticket-server.ts       # 服务器端工单服务
  ├── user.ts                # 客户端用户服务
  └── user-server.ts         # 服务器端用户服务
```

## 注意事项

1. **Token 过期**: Supabase 会自动刷新 token，但需要确保 cookies 正确设置
2. **错误处理**: 401 错误会在客户端自动跳转到登录页，服务器端会抛出异常
3. **缓存**: 服务器端请求默认使用 `cache: "no-store"`，避免缓存认证数据
4. **环境变量**: 确保设置了 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 迁移指南

### 从客户端组件迁移到服务器端组件

**之前（客户端）:**
```typescript
"use client";
import { getVirtualMachines } from "@/services/vm";

export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    getVirtualMachines().then(setData);
  }, []);
  // ...
}
```

**之后（服务器端）:**
```typescript
import { getVirtualMachinesServer } from "@/services/vm-server";

export default async function Page() {
  const data = await getVirtualMachinesServer();
  // ...
}
```

这样可以：
- 减少客户端 JavaScript 体积
- 提高首屏加载速度
- 更好的 SEO
- 自动处理 token 传递

