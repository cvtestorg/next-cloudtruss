"use client";

import Link from "next/link";
import { Ticket, FileText } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
                <Link href="/actions" title="操作记录">
                    <Button
                        variant="ghost"
                        className="h-9 gap-2"
                    >
                        <FileText className="h-5 w-5" />
                        <span>操作记录</span>
                    </Button>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <Link href="/ticket" title="审批中心">
                    <Button
                        variant="ghost"
                        className="h-9 gap-2"
                    >
                        <Ticket className="h-5 w-5" />
                        <span>审批中心</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
}
