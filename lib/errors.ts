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
