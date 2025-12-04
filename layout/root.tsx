import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader as SidebarHeaderComponent,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar-header";
import {
  SidebarContentClient,
  SidebarFooterClient,
  HeaderClient,
  RootLayoutClient,
} from "./root-client";

export function RootLayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // 注意：认证页面的布局在 app/auth/layout.tsx 中单独处理
  // 这里只处理需要侧边栏的页面
  return (
    <RootLayoutClient>
      <Sidebar>
        <SidebarHeaderComponent>
          <SidebarHeader />
        </SidebarHeaderComponent>
        <SidebarContent>
          <SidebarContentClient />
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterClient />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <HeaderClient />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </RootLayoutClient>
  );
}
