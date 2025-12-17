"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "服务器配置错误，请联系管理员";
      case "AccessDenied":
        return "访问被拒绝，您可能没有权限";
      case "Verification":
        return "验证失败，请重试";
      case "Default":
      default:
        return "登录过程中发生错误，请重试";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle className="text-2xl font-bold">登录错误</CardTitle>
          </div>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            错误代码: {error || "未知错误"}
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/auth/login">返回登录</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

