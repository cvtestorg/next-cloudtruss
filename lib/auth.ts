import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";


import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url =
      process.env.KEYCLOAK_ISSUER +
      "/protocol/openid-connect/token";

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID as string,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken ?? "",
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
        console.error("RefreshAccessTokenError", refreshedTokens);
        // If the refresh token is invalid (e.g. expired or revoked), we should not return the old token
        // incorrectly marked as valid-ish. We must signal a hard error.
        return {
            ...token,
            error: "RefreshTokenError",
        };
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + (refreshedTokens.expires_in * 1000), 
      // Fall back to old refresh token if new one is not returned
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, 
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);

    return {
      ...token,
      error: "RefreshTokenError",
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token?.error) {
        session.error = token.error;
      }
      return session;
    },
    async jwt({ token, user, account }) {
        // Initial sign in
        if (account && user) {
            return {
                ...token,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: Date.now() + ((account.expires_in as number) * 1000),
                sub: user.id
            }
        }

        // Return previous token if the access token has not expired yet
        if (Date.now() < (token.expiresAt as number)) {
            return token;
        }

        // If the token already has an error (e.g. RefreshTokenError), do not try to refresh again.
        // This prevents an infinite loop of failing refreshes.
        if (token.error) {
            return token;
        }

        // Access token has expired, try to update it
        return refreshAccessToken(token);
    }
  },
  // Ensure we trust the host in production or behind proxies
  trustHost: true,
});
