import { headers } from "next/headers";
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
import {
  SidebarContentClient,
  SidebarFooterClient,
  HeaderClient,
  RootLayoutClient,
} from "./root-client";

export async function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // 认证页面不显示侧边栏
  if (pathname === "/auth/login") {
    return <>{children}</>;
  }

  // 获取用户信息
  const user = await getServerUser();
  const userInfo = getUserInfo(user);

  // 其他页面显示侧边栏
  return (
    <RootLayoutClient>
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
          <SidebarContentClient user={user} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterClient userInfo={userInfo} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <HeaderClient />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </RootLayoutClient>
  );
}
