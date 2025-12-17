import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { AuthLoginRoute } from "@/config/routes";

export default async function DashboardPage() {
    // 双重保险：在页面级别也检查认证状态
    const user = await getServerUser();
    
    // 如果用户未登录，重定向到登录页
    // 注意：这里不检查是否已经在登录页，避免循环重定向
    if (!user) {
        redirect(AuthLoginRoute);
    }
    
    return (
        <div className="flex flex-col gap-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
    );
}
