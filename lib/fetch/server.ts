import { getServerAccessToken } from "@/lib/auth/server";

/**
 * 服务器端 API 调用函数
 * 用于 Server Components、Server Actions 和 Route Handlers
 * 自动从 NextAuth session 中获取 access_token 并添加到请求头
 */

async function getToken(): Promise<string | null> {
  return await getServerAccessToken();
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
        throw new Error(
          "Unauthorized: Invalid or missing authentication token"
        );
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
        throw new Error(
          "Unauthorized: Invalid or missing authentication token"
        );
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
        throw new Error(
          "Unauthorized: Invalid or missing authentication token"
        );
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
        throw new Error(
          "Unauthorized: Invalid or missing authentication token"
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export { serverApi };
