import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader as SidebarHeaderComponent,
    SidebarInset,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { getServerUser } from "@/lib/auth/server";
import { getUserInfo } from "@/lib/user-utils";
import { AppSidebarProvider } from "@/components/sidebar/app-sidebar-provider";
import { AppSidebarNav } from "@/components/sidebar/app-sidebar-nav";
import { AppSidebarFooter } from "@/components/sidebar/app-sidebar-footer";
import { AppHeader } from "@/components/sidebar/app-header";
import { redirect } from "next/navigation";
import { AuthLoginRoute } from "@/config/routes";

export async function AppSidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 获取用户信息
    const user = await getServerUser();
    
    // 如果用户未登录，重定向到登录页
    // 注意：这里不检查是否已经在登录页，避免循环重定向
    if (!user) {
        redirect(AuthLoginRoute);
    }
    
    const userInfo = getUserInfo(user);

    return (
        <AppSidebarProvider>
            <Sidebar>
                <SidebarHeaderComponent>
                    <div className="flex flex-col gap-1 px-2 py-2">
                        <Link href="/" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
                            <LayoutGrid className="size-5 text-primary" />
                            <span className="font-semibold text-lg">{siteConfig.name}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground px-7 line-clamp-2">
                            {siteConfig.description}
                        </p>
                    </div>
                </SidebarHeaderComponent>
                <SidebarContent>
                    <AppSidebarNav user={userInfo} />
                </SidebarContent>
                <SidebarFooter>
                    <AppSidebarFooter userInfo={userInfo} />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 overflow-auto p-4">{children}</main>
            </SidebarInset>
        </AppSidebarProvider>
    );
}
