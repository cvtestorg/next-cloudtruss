"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppHeader() {
    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
            <SidebarTrigger />
            <Link href="/ticket" title="审批中心">
                <Button
                    variant="ghost"
                    className="h-9 gap-2"
                >
                    <Ticket className="h-5 w-5" />
                    <span>审批中心</span>
                </Button>
            </Link>
        </header>
    );
}
