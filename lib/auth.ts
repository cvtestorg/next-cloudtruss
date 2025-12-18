import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

// NextAuth v5 支持 AUTH_SECRET 和 NEXTAUTH_SECRET，优先使用 AUTH_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!authSecret) {
  console.warn(
    "警告: AUTH_SECRET 或 NEXTAUTH_SECRET 环境变量未设置。这可能导致 JWT 解密错误。"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: authSecret,
  // 改进错误处理：当 JWT 解密失败时，不抛出错误，而是返回 null session
  trustHost: true,
});
