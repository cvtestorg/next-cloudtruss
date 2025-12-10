import { signIn, signOut } from "@/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Key } from "lucide-react"

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const callbackUrl = params.callbackUrl || DEFAULT_LOGIN_REDIRECT
  const hasCallbackUrl = !!params.callbackUrl

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>使用 Keycloak 单点登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server"
              // 如果有 callbackUrl，说明可能是 API token 过期导致的重定向
              // 先清除现有 session，强制用户重新登录以刷新 token
              const shouldClearSession = formData.get("hasCallbackUrl") === "true"
              const callbackUrlParam = formData.get("callbackUrl") as string || DEFAULT_LOGIN_REDIRECT
              
              if (shouldClearSession) {
                await signOut({ redirect: false })
              }
              await signIn("keycloak", { callbackUrl: callbackUrlParam })
            }}
          >
            <input type="hidden" name="hasCallbackUrl" value={hasCallbackUrl.toString()} />
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" className="w-full">
              <Key className="size-4 mr-2" />
              Keycloak 单点登录
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}