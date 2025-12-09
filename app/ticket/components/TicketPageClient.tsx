"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { deleteTicketAction, getApprovalAction } from "@/actions/ticket";
import type { TicketListResponse, ApprovalResponse } from "@/types/ticket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TicketSearchFilterClient } from "./TicketSearchFilterClient";
import { TicketTable } from "./TicketTable";
import { TicketPaginationClient } from "./TicketPaginationClient";
import { ApprovalTimeline } from "./ApprovalTimeline";

interface TicketPageClientProps {
  data: TicketListResponse;
  currentPage: number;
}

export function TicketPageClient({
  data,
  currentPage,
}: TicketPageClientProps) {
  const router = useRouter();
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalResponse | null>(
    null
  );
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 获取审批详情
  const fetchApproval = async (approvalId: string) => {
    setIsLoadingApproval(true);
    setApprovalError(null);
    try {
      const result = await getApprovalAction(approvalId);
      setApprovalData(result);
    } catch (err) {
      setApprovalError(err instanceof Error ? err : new Error("未知错误"));
    } finally {
      setIsLoadingApproval(false);
    }
  };

  const handleDetailClick = (ticketId: string) => {
    setSelectedApprovalId(ticketId);
    setIsDetailOpen(true);
    fetchApproval(ticketId);
  };

  const handleDeleteClick = (ticketId: string) => {
    setDeleteTicketId(ticketId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTicketId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTicketAction(deleteTicketId);
      toast.success("删除申请单成功", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setIsDeleteDialogOpen(false);
      setDeleteTicketId(null);
      router.refresh();
    } catch (err) {
      console.error("删除失败:", err);
      toast.error("删除申请单失败", {
        description: err instanceof Error ? err.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
        <TicketSearchFilterClient />
      </Suspense>

      <div className="rounded-lg border relative">
        <TicketTable
          tickets={data.data}
          onDeleteClick={handleDeleteClick}
          onDetailClick={handleDetailClick}
          isDeleting={isDeleting}
        />
      </div>

      {data.pages > 1 && (
        <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
          <TicketPaginationClient
            currentPage={currentPage}
            totalPages={data.pages}
          />
        </Suspense>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="overflow-auto">
          <DialogHeader>
            <DialogTitle>审批详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingApproval ? (
              <div className="text-center py-8 text-muted-foreground">
                加载中...
              </div>
            ) : approvalError ? (
              <div className="text-center py-8 text-destructive">
                加载失败:{" "}
                {approvalError instanceof Error
                  ? approvalError.message
                  : "未知错误"}
              </div>
            ) : approvalData &&
              approvalData.data &&
              approvalData.data.length > 0 ? (
              <div className="space-y-4">
                <ApprovalTimeline
                  tasks={approvalData.data[0].data.tasks}
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个申请单吗? 此操作不可撤销.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
