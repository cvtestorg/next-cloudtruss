"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import {
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/sidebar/user";
import { DarkLightToggle } from "@/components/theme/dark-light";
import { TweakcnThemeSelector } from "@/components/theme/tweakcn-selector";
import { siteConfig } from "@/config/site";

interface AppSidebarFooterProps {
    userInfo: {
        name: string;
        email: string;
        avatar: string;
        initials?: string;
    };
}

export function AppSidebarFooter({ userInfo }: AppSidebarFooterProps) {
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
