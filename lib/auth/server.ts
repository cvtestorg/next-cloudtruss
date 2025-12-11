import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

export async function getServerAccessToken(): Promise<string | null> {
  const tokenResult = await auth.api
    .getAccessToken({
      body: {
        providerId: "keycloak",
      },
      headers: await headers(),
    })
    .catch(() => null);

  return tokenResult?.accessToken || null;
}
