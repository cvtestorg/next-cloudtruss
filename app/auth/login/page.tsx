"use client";

import { authClient } from "@/lib/auth/client";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT;
  const hasCallbackUrl = !!searchParams.get("callbackUrl");

  const handleSignIn = async () => {
    try {
      // 如果有 callbackUrl，说明可能是 API token 过期导致的重定向
      // 先清除现有 session，强制用户重新登录以刷新 token
      if (hasCallbackUrl) {
        await authClient.signOut();
      }
      // Better Auth 使用 oauth2 方法进行登录
      await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: callbackUrl,
        scopes: ["openid", "profile", "email"],
      });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>使用 Keycloak 单点登录</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            <Key className="size-4 mr-2" />
            Keycloak 单点登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}