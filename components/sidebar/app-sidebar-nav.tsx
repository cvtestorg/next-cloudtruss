"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { menuItems } from "@/config/menu";

// Define strict types for user
interface AppSidebarNavProps {
    user: any; // Ideally this should be User/Session type but 'any' matches existing check
}

export function AppSidebarNav({ user }: AppSidebarNavProps) {
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
