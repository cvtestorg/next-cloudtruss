"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
import { menuItems } from "@/config/menu";

// Define strict types for user
interface AppSidebarNavProps {
    user: { name: string; email: string; avatar: string; initials: string } | null | undefined;
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
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isOpen = openMenus[item.title] ?? false;

                        if (item.subItems) {
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.2,
                                        }}
                                    >
                                        <Collapsible
                                            open={isOpen}
                                            onOpenChange={() =>
                                                setToggledMenus((prev) => ({
                                                    ...prev,
                                                    [item.title]: !prev[item.title],
                                                }))
                                            }
                                        >
                                        <CollapsibleTrigger asChild>
                                            <motion.div
                                                whileHover={{ x: 2 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <SidebarMenuButton>
                                                    <Icon className="size-4" />
                                                    <span>{item.title}</span>
                                                    <motion.div
                                                        animate={{
                                                            rotate: isOpen ? 90 : 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                            ease: "easeInOut",
                                                        }}
                                                    >
                                                        <ChevronRight className="ml-auto size-4" />
                                                    </motion.div>
                                                </SidebarMenuButton>
                                            </motion.div>
                                        </CollapsibleTrigger>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <CollapsibleContent>
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    >
                                                        <SidebarMenuSub>
                                                            {item.subItems.map((subItem, index) => (
                                                                <motion.div
                                                                    key={subItem.href}
                                                                    initial={{ x: -10, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    transition={{
                                                                        delay: index * 0.03,
                                                                        duration: 0.2,
                                                                    }}
                                                                >
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={pathname === subItem.href}
                                                                        >
                                                                            <Link href={subItem.href}>{subItem.title}</Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                </motion.div>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </motion.div>
                                                </CollapsibleContent>
                                            )}
                                        </AnimatePresence>
                                        </Collapsible>
                                    </motion.div>
                                </SidebarMenuItem>
                            );
                        }

                        return (
                            <SidebarMenuItem key={item.title}>
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: index * 0.05,
                                        duration: 0.2,
                                    }}
                                >
                                    <motion.div
                                        whileHover={{ x: 2 }}
                                        transition={{ duration: 0.2 }}
                                    >
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
                                    </motion.div>
                                </motion.div>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
