"use client";

import { useState } from "react";
import { ClipboardCheck, LandPlot } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApprovalCenterSheet } from "@/components/approval-center-sheet";
import { ActionCenterSheet } from "@/components/action-center-sheet";

export function AppHeader() {
    const [isApprovalSheetOpen, setIsApprovalSheetOpen] = useState(false);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

    return (
        <>
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
                <SidebarTrigger />
                <div className="flex items-center gap-1 mr-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setIsActionSheetOpen(true)}
                        title="操作记录"
                    >
                        <LandPlot className="h-5 w-5" />
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setIsApprovalSheetOpen(true)}
                        title="审批中心"
                    >
                        <ClipboardCheck className="h-5 w-5" />
                    </Button>
                </div>
            </header>
            <ActionCenterSheet
                open={isActionSheetOpen}
                onOpenChange={setIsActionSheetOpen}
            />
            <ApprovalCenterSheet
                open={isApprovalSheetOpen}
                onOpenChange={setIsApprovalSheetOpen}
            />
        </>
    );
}
