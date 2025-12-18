import { auth } from "@/lib/auth";

export async function getServerUser() {
  try {
    const session = await auth();
    return session?.user || null;
  } catch (error) {
    // 如果认证系统出错（比如缺少 AUTH_SECRET），返回 null
    // 这样页面可以正常重定向到登录页，而不是崩溃
    console.error("[Auth Server] Failed to get server user:", error);
    return null;
  }
}

export async function getServerAccessToken(): Promise<string | null> {
  try {
    const session = await auth();
    return (session?.accessToken as string) || null;
  } catch (error) {
    // 如果认证系统出错，返回 null
    console.error("[Auth Server] Failed to get server access token:", error);
    return null;
  }
}
