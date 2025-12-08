import { signIn } from "@/auth"
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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>使用 Keycloak 单点登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("keycloak", { callbackUrl: DEFAULT_LOGIN_REDIRECT })
            }}
          >
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