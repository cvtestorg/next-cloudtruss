"use server";

import { signOut } from "@/lib/auth";
import { AuthLoginRoute } from "@/config/routes";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/login" });
}

/**
 * 处理 401 未授权错误
 * 当 AccessToken 过期时，重定向到 signout Route Handler
 * Route Handler 可以安全地修改 cookies 并执行 signOut
 * 这个函数应该在 Server Component 中捕获 UnauthorizedError 后调用
 */
export async function handleUnauthorizedAction(pathname?: string): Promise<never> {
  // 构建重定向 URL，包含回调地址（如果有）
  const callbackUrl = pathname
    ? encodeURIComponent(pathname)
    : undefined;
  
  // 重定向到 signout Route Handler，它会处理 cookies 清理和重定向
  const signoutUrl = callbackUrl
    ? `/api/auth/signout?callbackUrl=${callbackUrl}`
    : "/api/auth/signout";
  
  redirect(signoutUrl);
}
