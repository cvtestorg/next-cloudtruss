import { headers } from "next/headers";
import { getServerAccessToken } from "@/lib/auth/server";
import { clearSessionAction } from "@/actions/auth";

/**
 * 服务器端 API 调用函数
 * 用于 Server Components、Server Actions 和 Route Handlers
 * 自动从 Better Auth session 中获取 access_token 并添加到请求头
 * 当遇到 401 错误时，先清空 session，然后重定向到登录页
 */

async function getToken(): Promise<string | null> {
  return await getServerAccessToken();
}

/**
 * 处理 401 未授权错误，使用 Server Action 清除 session cookies
 * Server Action 中可以安全地修改 cookies，比 Route Handler 更简洁
 */
async function handleUnauthorized(): Promise<never> {
  // 获取当前路径作为回调 URL
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  // 调用 Server Action 清除 session 并重定向
  // Server Action 内部会删除 cookies 并执行 redirect
  await clearSessionAction(pathname);

  // 这行代码不会执行，因为 clearSessionAction 会抛出 redirect 错误
  // 但 TypeScript 需要这个返回值
  throw new Error("Should have redirected");
}

const serverApi = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const urlObj = new URL(url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value));
        }
      });
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = await getToken();
    // console.log("token", token);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(urlObj.toString(), {
      method: "GET",
      headers,
      cache: "no-store", // 服务器端请求通常不需要缓存
    });

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async delete<T>(url: string): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export { serverApi };
