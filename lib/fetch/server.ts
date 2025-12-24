import { getServerAccessToken } from "@/lib/auth/server";
import { UnauthorizedError } from "@/lib/errors";

/**
 * 服务器端 API 调用函数
 * 用于 Server Components、Server Actions 和 Route Handlers
 * 自动从 Better Auth session 中获取 access_token 并添加到请求头
 * 当遇到 401 错误时，抛出 UnauthorizedError，由调用方处理
 */

async function getToken(): Promise<string | null> {
  return await getServerAccessToken();
}

/**
 * 处理 401 未授权错误
 * 抛出 UnauthorizedError，由调用方（Server Component 或 Server Action）捕获并处理
 * 这样可以确保在正确的上下文中调用 Server Action 来清除 session
 */
function handleUnauthorized(): never {
  throw new UnauthorizedError("Access token expired or invalid");
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
    console.log("token", token);
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
