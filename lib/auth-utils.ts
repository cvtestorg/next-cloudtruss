const AUTH_PAGES = ["/auth/login", "/auth/callback"];

/**
 * 检查当前路径是否为认证相关页面
 */
export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.includes(pathname);
}

/**
 * 导出认证页面常量供其他地方使用
 */
export { AUTH_PAGES };

/**
 * 解析 OAuth 错误信息
 */
export function getOAuthErrorMessage(
  error: string | null,
  errorCode: string | null,
  errorDescription: string | null
): string {
  if (!error) return "登录失败";

  const decoded = errorDescription
    ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
    : "";

  if (errorCode === "provider_email_needs_verification") {
    return "需要验证邮箱";
  }
  if (decoded.includes("user profile")) {
    return "无法获取用户信息，请检查 Keycloak 配置";
  }
  if (decoded.includes("code_challenge")) {
    return "PKCE 配置错误，请联系管理员";
  }

  return decoded || error || "登录失败";
}

