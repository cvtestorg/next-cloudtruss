import { AuthLoginRoute, DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js 16 Proxy 函数
 *
 * 最佳实践：使用 cookie-only 检查进行乐观重定向
 * - 只检查 session cookie 是否存在，不进行数据库验证
 * - 避免在 proxy 中进行阻塞的 API 或数据库调用
 * - 完整的 session 验证应该在各个页面/路由中单独进行
 *
 * 注意：这只是一个乐观检查，不能用于安全验证
 * 安全验证必须在受保护的页面中使用 auth.api.getSession()
 */
export default async function proxy(request: NextRequest) {
  // 使用 cookie-only 检查，避免数据库查询
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // 如果未认证，则重定向到登录页
  if (!sessionCookie && pathname !== AuthLoginRoute) {
    const newUrl = new URL(AuthLoginRoute, request.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // 如果访问登录页
  if (pathname === AuthLoginRoute) {
    // 如果已认证且有 callbackUrl，说明可能是从 API 401 重定向过来的
    // 此时应该允许用户看到登录页，让用户重新登录以刷新 token
    if (sessionCookie && request.nextUrl.searchParams.has("callbackUrl")) {
      // 有 callbackUrl 说明是 API token 过期导致的重定向
      // 允许用户看到登录页，让用户重新登录以刷新 token
      // 不进行重定向，让登录页正常显示
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }

    // 如果已认证但没有 callbackUrl，重定向到首页
    if (sessionCookie) {
      const newUrl = new URL(DEFAULT_LOGIN_REDIRECT, request.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    // 未认证，允许访问登录页
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // 设置路径 header 供服务端组件使用
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api/auth (auth API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
