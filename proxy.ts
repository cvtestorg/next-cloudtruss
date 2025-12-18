import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthLoginRoute, DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  try {
    const session = await auth();
    const { pathname } = new URL(request.url);

    // 如果已经登录且在登录页，重定向到 dashboard
    if (session && pathname === AuthLoginRoute) {
      return NextResponse.redirect(
        new URL(DEFAULT_LOGIN_REDIRECT, request.url)
      );
    }

    // 如果未登录且不在登录页，重定向到登录页
    if (!session && pathname !== AuthLoginRoute) {
      return NextResponse.redirect(new URL(AuthLoginRoute, request.url));
    }

    // 其他情况允许继续访问
    return NextResponse.next();
  } catch (error) {
    // 如果认证系统出错（比如 JWT 解密失败），清除可能损坏的 session 并重定向到登录页
    console.error("[Proxy] Auth error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    const { pathname } = new URL(request.url);
    if (pathname !== AuthLoginRoute) {
      return NextResponse.redirect(new URL(AuthLoginRoute, request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
