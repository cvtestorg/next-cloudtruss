import { auth } from "@/lib/auth";

export async function getServerUser() {
  const session = await auth();
  return session?.user || null;
}

export async function getServerAccessToken(): Promise<string | null> {
  const session = await auth();
  // @ts-ignore
  return (session?.accessToken as string) || null;
}
