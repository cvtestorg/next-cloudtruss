"use client";

import { SessionProvider as NextAuthSessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect, ReactNode } from "react";

function AuthErrorListener({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // If we detect a RefreshTokenError, it means the refresh token is invalid/expired
    // and we must force a sign out to clear the bad session and redirect to login.
    if (session?.error === "RefreshTokenError") {
      signOut();
    }
  }, [session]);

  return <>{children}</>;
}

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <AuthErrorListener>{children}</AuthErrorListener>
    </NextAuthSessionProvider>
  );
}
