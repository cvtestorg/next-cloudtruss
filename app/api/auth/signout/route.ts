import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthLoginRoute } from "@/config/routes";
import { NextRequest } from "next/server";

/**
 * Route Handler 用于处理 signout
 * Route Handler 可以安全地修改 cookies
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl");
  
  // 构建重定向 URL，包含回调地址（如果有）
  const redirectTo = callbackUrl
    ? `${AuthLoginRoute}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : AuthLoginRoute;
  
  // signOut 会自动清除所有相关的 cookies 并重定向
  await signOut({ redirectTo });
  
  // 如果 signOut 没有重定向，手动重定向
  redirect(redirectTo);
}

