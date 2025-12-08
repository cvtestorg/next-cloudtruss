import { auth } from "@/auth";

export async function getServerUser() {
  const session = await auth();
  return session?.user || null;
}

export async function getServerAccessToken(): Promise<string | null> {
  const session = await auth();
  return (session?.access_token as string) || null;
}
