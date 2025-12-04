"use client"

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOAuthErrorMessage } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    // 检查 URL 中的错误参数
    const error = searchParams.get("error")
    if (error) {
      const errorCode = searchParams.get("error_code");
      const errorDescription = searchParams.get("error_description");
      const message = getOAuthErrorMessage(error, errorCode, errorDescription);
      
      // 使用 setTimeout 避免同步 setState
      setTimeout(() => {
        setStatus("error")
        setErrorMessage(message)
      }, 0)
      
      logger.error("OAuth error:", error, errorCode, errorDescription);
      
      const redirectDelay = errorCode === "provider_email_needs_verification" ? 8000 : 5000
      setTimeout(() => router.push("/auth/login"), redirectDelay)
      return
    }

    // 监听 auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setStatus("success")
          setTimeout(() => router.push("/"), 1000)
        } else if (event === "SIGNED_OUT") {
          setStatus("error")
          setErrorMessage("登录已取消")
          setTimeout(() => router.push("/auth/login"), 2000)
        }
      }
    )

    // 设置超时保护
    const timeout = setTimeout(() => {
      setErrorMessage("登录超时，请重试")
      setStatus("error")
      subscription.unsubscribe()
      setTimeout(() => router.push("/auth/login"), 2000)
    }, 10000)

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">正在处理登录...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg font-medium">登录成功！</p>
            <p className="text-sm text-muted-foreground">正在跳转...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg font-medium text-destructive">登录失败</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {errorMessage === "需要验证邮箱" && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-medium mb-2">验证邮箱说明：</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Supabase 已向您的 Keycloak 邮箱发送了验证邮件</li>
                  <li>请检查邮箱（包括垃圾邮件文件夹）并点击验证链接</li>
                  <li>验证完成后，您可以重新尝试登录</li>
                  <li className="mt-2 text-xs italic">提示：管理员可以在 Supabase Dashboard 中禁用 OAuth 邮箱验证要求</li>
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">正在返回登录页面...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">正在处理登录...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}