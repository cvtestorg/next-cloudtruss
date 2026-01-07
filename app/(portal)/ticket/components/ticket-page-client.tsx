"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  deleteTicketAction,
  getApprovalAction,
  getTicketDetailAction,
  submitApprovalAction,
  rollbackApprovalAction,
} from "@/actions/ticket";
import type {
  TicketListResponse,
  ApprovalResponse,
  TicketDetailResponse,
} from "@/types/ticket";
import {
  TICKET_TYPE_VIRTUALIZATION,
  TICKET_TYPE_PERMISSION,
} from "@/types/ticket";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { TicketSearchFilterClient } from "./ticket-search-filter-client";
import { TicketTable } from "./ticket-table";
import { TicketPaginationClient } from "./ticket-pagination-client";
import { ApprovalTimeline } from "./approval-timeline";
import { TicketTypeTabs } from "./ticket-type-tabs";
import { VirtualizationTicketData } from "./virtualization-ticket-data";
import { PermissionTicketData } from "./permission-ticket-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TicketPageClientProps {
  data: TicketListResponse;
  currentPage: number;
}

export function TicketPageClient({
  data,
  currentPage,
}: TicketPageClientProps) {
  const router = useRouter();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalResponse | null>(
    null
  );
  const [ticketDetail, setTicketDetail] = useState<TicketDetailResponse | null>(
    null
  );
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState("同意");
  const [rejectComment, setRejectComment] = useState("不同意");
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);

  // 获取审批详情和工单详情
  const fetchDetailData = async (ticketId: string) => {
    setIsLoadingApproval(true);
    setApprovalError(null);
    try {
      // 并行获取审批详情和工单详情
      const [approvalResult, ticketResult] = await Promise.all([
        getApprovalAction(ticketId),
        getTicketDetailAction(ticketId),
      ]);
      setApprovalData(approvalResult);
      setTicketDetail(ticketResult);
    } catch (err) {
      setApprovalError(err instanceof Error ? err : new Error("未知错误"));
    } finally {
      setIsLoadingApproval(false);
    }
  };

  const handleDetailClick = (ticketId: string) => {
    console.log("[handleDetailClick] ticketId:", ticketId);
    setCurrentTicketId(ticketId);
    setIsDetailOpen(true);
    fetchDetailData(ticketId);
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

  const handleApproveConfirm = async () => {
    if (!currentTicketId || isApproving) return;

    console.log("[handleApproveConfirm] currentTicketId:", currentTicketId);
    console.log("[handleApproveConfirm] approvalComment:", approvalComment);
    setIsApproving(true);
    try {
      await submitApprovalAction(
        currentTicketId,
        approvalComment
      );
      toast.success("审批通过", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setApproveDialogOpen(false);
      setIsDetailOpen(false);
      router.refresh();
    } catch (err) {
      console.error("审批失败:", err);
      toast.error("审批失败", {
        description: err instanceof Error ? err.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!currentTicketId || isRejecting) return;

    console.log("[handleRejectConfirm] currentTicketId:", currentTicketId);
    console.log("[handleRejectConfirm] rejectComment:", rejectComment);
    setIsRejecting(true);
    try {
      await rollbackApprovalAction(
        currentTicketId,
        0,
        rejectComment
      );
      toast.success("已驳回", {
        icon: <XCircle className="h-4 w-4" />,
      });
      setRejectDialogOpen(false);
      setIsDetailOpen(false);
      router.refresh();
    } catch (err) {
      console.error("驳回失败:", err);
      toast.error("驳回失败", {
        description: err instanceof Error ? err.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
        <TicketSearchFilterClient />
      </Suspense>
      <TicketTypeTabs />

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

      <Sheet
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            // 关闭时清理状态
            setApprovalData(null);
            setTicketDetail(null);
            setApprovalError(null);
            setCurrentTicketId(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto p-6"
          showCloseButton={false}
        >
          {isLoadingApproval ? (
            <>
              <SheetHeader className="p-0">
                <SheetTitle>审批详情</SheetTitle>
              </SheetHeader>
              <div className="mt-6 text-center py-8 text-muted-foreground">
                加载中...
              </div>
            </>
          ) : approvalError ? (
            <>
              <SheetHeader className="p-0">
                <SheetTitle>审批详情</SheetTitle>
              </SheetHeader>
              <div className="mt-6 text-center py-8 text-destructive">
                加载失败:{" "}
                {approvalError instanceof Error
                  ? approvalError.message
                  : "未知错误"}
              </div>
            </>
          ) : approvalData &&
            approvalData.data &&
            approvalData.data.length > 0 &&
            ticketDetail?.data ? (
            <Tabs defaultValue="approval" className="w-full">
              <div className="flex items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="approval">审批信息</TabsTrigger>
                  <TabsTrigger value="data">审批数据</TabsTrigger>
                </TabsList>
                {approvalData.data[0].finish_time === null && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => setApproveDialogOpen(true)}
                      disabled={isApproving || isRejecting}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isApproving ? "审批中..." : "审批"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={isApproving || isRejecting}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isRejecting ? "驳回中..." : "驳回"}
                    </Button>
                  </div>
                )}
              </div>
              <TabsContent value="approval" className="mt-4">
                <ApprovalTimeline
                  tasks={approvalData.data[0].tasks}
                />
              </TabsContent>
              <TabsContent value="data" className="mt-4">
                {ticketDetail.data.type_id === TICKET_TYPE_VIRTUALIZATION ? (
                  <VirtualizationTicketData ticket={ticketDetail.data} />
                ) : ticketDetail.data.type_id === TICKET_TYPE_PERMISSION ? (
                  <PermissionTicketData ticket={ticketDetail.data} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">暂不支持此类型的审批数据展示</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <SheetHeader className="p-0">
                <SheetTitle>审批详情</SheetTitle>
              </SheetHeader>
            </>
          )}
        </SheetContent>
      </Sheet>

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

      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(open) => {
          setApproveDialogOpen(open);
          if (!open) {
            setApprovalComment("同意");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认审批</AlertDialogTitle>
            <AlertDialogDescription>
              确定要通过这个申请单吗?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Textarea
              id="approval-comment"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="请输入审批建议"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={isApproving}
            >
              {isApproving ? "审批中..." : "确认审批"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          setRejectDialogOpen(open);
          if (!open) {
            setRejectComment("不同意");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认驳回</AlertDialogTitle>
            <AlertDialogDescription>
              确定要驳回这个申请单吗? 此操作不可撤销.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Textarea
              id="reject-comment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="请输入驳回原因"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRejecting}
            >
              {isRejecting ? "驳回中..." : "确认驳回"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
