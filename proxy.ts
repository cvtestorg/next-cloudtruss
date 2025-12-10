import { auth } from "@/auth";
import { AuthLoginRoute, DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { NextResponse } from "next/server";

export default auth((req) => {
  // 如果未认证，则重定向到登录页
  if (!req.auth && req.nextUrl.pathname !== AuthLoginRoute) {
    const newUrl = new URL(AuthLoginRoute, req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // 如果访问登录页
  if (req.nextUrl.pathname === AuthLoginRoute) {
    // 如果已认证且有 callbackUrl，说明可能是从 API 401 重定向过来的
    // 此时应该清除 session 并允许用户重新登录，而不是重定向回去
    // 因为重定向回去会导致循环（API token 已过期）
    if (req.auth && req.nextUrl.searchParams.has("callbackUrl")) {
      // 有 callbackUrl 说明是 API token 过期导致的重定向
      // 允许用户看到登录页，让用户重新登录以刷新 token
      // 不进行重定向，让登录页正常显示
      const response = NextResponse.next();
      response.headers.set("x-pathname", req.nextUrl.pathname);
      return response;
    }

    // 如果已认证但没有 callbackUrl，重定向到首页
    if (req.auth) {
      const newUrl = new URL(DEFAULT_LOGIN_REDIRECT, req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    // 未认证，允许访问登录页
    const response = NextResponse.next();
    response.headers.set("x-pathname", req.nextUrl.pathname);
    return response;
  }

  // 设置路径 header 供服务端组件使用
  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
  return response;
});

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
