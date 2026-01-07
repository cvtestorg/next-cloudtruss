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

    const finalUrl = urlObj.toString();
    console.log("[serverApi.get] Final Request:");
    console.log("  URL:", finalUrl);
    if (params) {
      console.log("  Query Params:", JSON.stringify(params, null, 2));
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = await getToken();
    console.log("token", token);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(finalUrl, {
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
    console.log(
      "[serverApi.post] Token:",
      token ? "exists" : "null",
      "URL:",
      url
    );
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[serverApi.post] No access token available for URL:", url);
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

      // 尝试获取错误详情
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // 先读取为 text，避免 body 被重复读取
        const text = await response.text();
        try {
          // 尝试解析为 JSON
          const errorData = JSON.parse(text);
          if (errorData.message) {
            errorMessage = `${errorMessage}: ${errorData.message}`;
          } else if (errorData.error) {
            errorMessage = `${errorMessage}: ${errorData.error}`;
          } else if (typeof errorData === "string") {
            errorMessage = `${errorMessage}: ${errorData}`;
          }
          console.error("[serverApi.post] Error response:", errorData);
        } catch {
          // 如果不是 JSON，直接使用 text
          console.error("[serverApi.post] Error response (text):", text);
          if (text) {
            errorMessage = `${errorMessage}: ${text}`;
          }
        }
      } catch {
        // 如果读取 text 也失败，使用默认错误消息
        console.error("[serverApi.post] Failed to read error response");
      }

      throw new Error(errorMessage);
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
