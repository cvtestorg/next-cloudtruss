"use server";

import { signOut } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLoginRoute } from "@/config/routes";

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/login" });
}

/**
 * 清除过期的 session cookies
 * 用于处理 401 错误时的 session 清理
 * Server Action 中可以安全地修改 cookies
 */
export async function clearSessionAction(callbackUrl?: string): Promise<never> {
  const cookieStore = await cookies();

  // 删除 NextAuth session cookies
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("authjs.csrf-token");
  cookieStore.delete("authjs.callback-url");

  // 重定向到登录页
  const loginUrl = callbackUrl
    ? `${AuthLoginRoute}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : AuthLoginRoute;

  redirect(loginUrl);
}
