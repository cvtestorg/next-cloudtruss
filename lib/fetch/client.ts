"use client";

import { authClient } from "@/lib/auth/client";

export async function getAccessToken(): Promise<string | null> {
  const session = await authClient.getSession();
  return (session?.data?.user?.accessToken as string) || null;
}
