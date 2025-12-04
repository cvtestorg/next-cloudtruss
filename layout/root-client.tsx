"use client";

import React, { useState, useMemo } from "react";
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
import { getUserInfo } from "@/lib/user-utils";
import { useAuth } from "@/hooks/use-auth";

// 根布局客户端组件：提供 SidebarProvider 上下文
export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

// 侧边栏内容组件
export function SidebarContentClient() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [userToggledMenus, setUserToggledMenus] = useState<
    Record<string, boolean>
  >({});

  // 根据当前路径和默认展开配置计算应该展开的菜单
  const autoOpenMenus = useMemo(() => {
    const result: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.subItems) {
        if (item.defaultOpen) {
          result[item.title] = true;
        }
        const isActive = item.subItems.some(
          (subItem) => pathname === subItem.href
        );
        if (isActive) {
          result[item.title] = true;
        }
      }
    });
    return result;
  }, [pathname]);

  // 合并自动展开和用户手动切换的状态
  const openMenus = useMemo(() => {
    return { ...autoOpenMenus, ...userToggledMenus };
  }, [autoOpenMenus, userToggledMenus]);

  const toggleMenu = (title: string) => {
    setUserToggledMenus((prev) => ({
      ...prev,
      [title]: !openMenus[title],
    }));
  };

  // 服务器端和客户端首次渲染时，确保渲染相同的加载状态
  // useAuth hook 已经确保服务器端和客户端首次渲染时都返回 loading: true
  if (loading || !user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-center p-4 w-full">
                <div className="text-sm text-muted-foreground">加载中...</div>
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
            const isOpen = openMenus[item.title] || false;

            if (item.subItems) {
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(item.title)}
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
                              <a href={subItem.href}>{subItem.title}</a>
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
                  <a href={item.href}>
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// 侧边栏底部组件
export function SidebarFooterClient() {
  const { user, loading } = useAuth();

  // 服务器端和客户端首次渲染时，确保渲染相同的加载状态
  // useAuth hook 已经确保服务器端和客户端首次渲染时都返回 loading: true
  if (loading || !user) {
    return (
      <SidebarFooter>
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      </SidebarFooter>
    );
  }

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
      <NavUser user={getUserInfo(user)} />
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

// 顶部栏组件
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
