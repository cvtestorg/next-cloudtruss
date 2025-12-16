"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export function AppSidebarProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SidebarProvider>{children}</SidebarProvider>;
}
