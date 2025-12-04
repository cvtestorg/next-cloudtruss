import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

function redirectToLogin() {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    // 如果不在认证页面，则跳转到登录页
    if (!currentPath.startsWith("/auth/")) {
      window.location.href = "/auth/login";
    }
  }
}

/**
 * 客户端获取 access_token
 * 从 Supabase session 中获取 access_token，而不是从 localStorage 读取
 */
async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // 从 Supabase session 中获取 access_token
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      logger.warn("[Client API] AccessToken: null or missing, error:", error);
      redirectToLogin();
      return null;
    }

    // 打印 access_token (仅开发环境)
    logger.log("[Client API] AccessToken:", session.access_token);

    return session.access_token;
  } catch (err) {
    logger.error("[Client API] Failed to get AccessToken:", err);
    redirectToLogin();
    return null;
  }
}

const api = {
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
    });

    if (!response.ok) {
      // 401 未授权，跳转到登录页
      if (response.status === 401) {
        redirectToLogin();
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
    });

    if (!response.ok) {
      // 401 未授权，跳转到登录页
      if (response.status === 401) {
        redirectToLogin();
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
    });

    if (!response.ok) {
      // 401 未授权，跳转到登录页
      if (response.status === 401) {
        redirectToLogin();
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
    });

    if (!response.ok) {
      // 401 未授权，跳转到登录页
      if (response.status === 401) {
        redirectToLogin();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export { api };
