"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ExternalLink, ChevronRight, Ticket } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { NavUser } from "@/components/sidebar/user";
import { DarkLightToggle } from "@/components/theme/dark-light";
import { TweakcnThemeSelector } from "@/components/theme/tweakcn-selector";
import { cn } from "@/lib/utils";
import { menuItems } from "@/config/menu";
import { siteConfig } from "@/config/site";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

export function SidebarContentClient({
  user,
}: {
  user: any;
}) {
  const pathname = usePathname();
  const [toggledMenus, setToggledMenus] = useState<Record<string, boolean>>(
    {}
  );

  const openMenus = useMemo(() => {
    const result: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (!item.subItems) return;
      if (item.defaultOpen || item.subItems.some((s) => s.href === pathname)) {
        result[item.title] = true;
      }
    });
    return { ...result, ...toggledMenus };
  }, [pathname, toggledMenus]);

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-center p-4 w-full">
                <div className="text-sm text-muted-foreground">未登录</div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isOpen = openMenus[item.title] ?? false;

            if (item.subItems) {
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() =>
                    setToggledMenus((prev) => ({
                      ...prev,
                      [item.title]: !prev[item.title],
                    }))
                  }
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                        <ChevronRight
                          className={cn(
                            "ml-auto size-4 transition-transform duration-200",
                            isOpen && "rotate-90"
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href}>{subItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  {item.href ? (
                    <Link href={item.href}>
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div>
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function SidebarFooterClient({
  userInfo,
}: {
  userInfo: {
    name: string;
    email: string;
    avatar: string;
    initials?: string;
  };
}) {
  return (
    <SidebarFooter>
      <SidebarMenu>
        {siteConfig.links.docs && (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  href={siteConfig.links.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="size-4" />
                  <span>官方文档</span>
                  <ExternalLink className="ml-auto size-3 text-muted-foreground" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator />
          </>
        )}
      </SidebarMenu>
      <NavUser user={userInfo} />
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1">
          <DarkLightToggle />
        </div>
        <SidebarSeparator orientation="vertical" className="h-8" />
        <div className="flex-1">
          <TweakcnThemeSelector />
        </div>
      </div>
    </SidebarFooter>
  );
}

export function HeaderClient() {
  const router = useRouter();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <SidebarTrigger />
      <Button
        variant="ghost"
        onClick={() => router.push("/ticket")}
        className="h-9 gap-2"
        title="审批中心"
      >
        <Ticket className="h-5 w-5" />
        <span>审批中心</span>
      </Button>
    </header>
  );
}
