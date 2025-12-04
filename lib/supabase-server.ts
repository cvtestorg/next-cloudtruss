import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * 创建服务器端 Supabase 客户端
 * 用于 Server Components、Server Actions 和 Route Handlers
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 在 Server Component 中调用 setAll 会失败
            // 这是正常的，因为 middleware 会处理 session 刷新
          }
        },
      },
    }
  );
}

/**
 * 获取当前用户（服务器端）
 * 用于在 Server Components 中检查认证状态
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * 获取服务器端的 access_token
 * 用于在 Server Components 和 Server Actions 中调用后端 API
 */
export async function getServerAccessToken(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      return null;
    }

    return session.access_token;
  } catch {
    return null;
  }
}

