import { headers } from "next/headers";
import { handleUnauthorizedAction } from "@/actions/auth";

/**
 * 自定义 401 未授权错误
 * 用于标识需要重定向到登录页的错误
 */
export class UnauthorizedError extends Error {
  constructor(
    message: string = "Unauthorized: Invalid or missing authentication token"
  ) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * 在 Server Component 中处理可能抛出的 UnauthorizedError
 * 如果遇到 401 错误，清除 session 并重定向到登录页
 */
export async function handleServerApiError(error: unknown): Promise<never> {
  if (error instanceof UnauthorizedError) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("referer") || "/";
    await handleUnauthorizedAction(pathname);
  }
  // 其他错误重新抛出
  throw error;
}
