import { auth } from "@/auth";
import { AuthLoginRoute, DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { NextResponse } from "next/server";

export default auth((req) => {
  // 如果未认证，则重定向到登录页
  if (!req.auth && req.nextUrl.pathname !== AuthLoginRoute) {
    const newUrl = new URL(AuthLoginRoute, req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
  // 如果已认证，则重定向到默认首页
  if (req.auth && req.nextUrl.pathname === AuthLoginRoute) {
    const newUrl = new URL(DEFAULT_LOGIN_REDIRECT, req.nextUrl.origin);
    return Response.redirect(newUrl);
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
