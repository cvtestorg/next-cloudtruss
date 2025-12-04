"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Key } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/schemas/login";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // TODO: 实现邮箱密码登录逻辑
      logger.log("Login data:", data);
      toast.info("邮箱密码登录功能开发中", {
        description: "请使用 Keycloak 单点登录",
      });
      // 这里可以调用API进行登录
    } catch (error) {
      logger.error("Login error:", error);
      toast.error("登录失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  }

  const handleKeycloakLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "keycloak",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "openid profile email",
          queryParams: {
            // 确保请求用户信息所需的 scope
            scope: "openid profile email",
          },
        },
      })

      if (error) {
        logger.error("Keycloak login error:", error);
        toast.error("Keycloak 登录失败", {
          description: error.message || "请联系管理员",
        });
      }
      // Supabase 会自动重定向，不需要手动处理
    } catch (error) {
      logger.error("Keycloak login error:", error);
      toast.error("Keycloak 配置错误", {
        description: error instanceof Error ? error.message : "请联系管理员",
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>使用邮箱密码或单点登录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                登录
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                或使用单点登录
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleKeycloakLogin}
          >
            <Key className="size-4" />
            Keycloak 单点登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}