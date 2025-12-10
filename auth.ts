import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Keycloak],
  trustHost: true, // 允许在开发环境中使用动态 host
  session: {
    strategy: "jwt", // 明确使用 JWT 策略（因为没有 adapter）
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // 首次登录时，保存用户信息和 access_token
      if (account && user) {
        token.access_token = account.access_token;
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      // 将用户信息和 access_token 暴露到 session 中
      if (token) {
        session.access_token = token.access_token as string;
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 解析 URL
      const urlObj = new URL(url, baseUrl);

      // 如果重定向到登录页且有 callbackUrl 参数，提取 callbackUrl 并重定向
      if (urlObj.pathname === "/auth/login") {
        const callbackUrl = urlObj.searchParams.get("callbackUrl");
        if (callbackUrl) {
          // 解码并返回 callbackUrl
          return `${baseUrl}${decodeURIComponent(callbackUrl)}`;
        }
      }

      // 如果 URL 是相对路径，使用 baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 如果 URL 是同一个域名，允许重定向
      if (urlObj.origin === baseUrl) return url;
      // 否则重定向到默认首页
      return `${baseUrl}${DEFAULT_LOGIN_REDIRECT}`;
    },
  },
});
