"use client";

import { getSession } from "next-auth/react";

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return (session?.access_token as string) || null;
}
