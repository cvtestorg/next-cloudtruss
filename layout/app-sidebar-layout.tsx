import { LayoutGrid } from "lucide-react";
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

export async function AppSidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 获取用户信息
    const user = await getServerUser();
    const userInfo = getUserInfo(user);

    return (
        <AppSidebarProvider>
            <Sidebar>
                <SidebarHeaderComponent>
                    <div className="flex flex-col gap-1 px-2 py-2">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="size-5 text-primary" />
                            <span className="font-semibold text-lg">{siteConfig.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground px-7 line-clamp-2">
                            {siteConfig.description}
                        </p>
                    </div>
                </SidebarHeaderComponent>
                <SidebarContent>
                    <AppSidebarNav user={user} />
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
