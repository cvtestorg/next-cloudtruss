import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "keycloak",
          clientId: process.env.KEYCLOAK_CLIENT_ID as string,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
          discoveryUrl: `${process.env.KEYCLOAK_ISSUER}/.well-known/openid-configuration`,
          scopes: ["openid", "profile", "email"],
          redirectURI: `${baseURL}/api/auth/oauth2/callback/keycloak`,
          mapProfileToUser: async (profile: Record<string, unknown>) => {
            return {
              id: profile.sub as string,
              email: profile.email as string,
              name: profile.name as string,
              image: profile.picture as string | undefined,
            };
          },
        },
      ],
    }),
  ],
  account: {
    storeAccountCookie: true,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60 * 2, // 2 hours
  },
});
