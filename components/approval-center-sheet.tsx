"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  deleteTicketAction,
  getApprovalAction,
  getTicketDetailAction,
  submitApprovalAction,
  rollbackApprovalAction,
  getTicketsAction,
} from "@/actions/ticket";
import type {
  TicketListResponse,
  ApprovalResponse,
  TicketDetailResponse,
  GetTicketsParams,
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
import { TicketTable } from "@/app/(portal)/ticket/components/ticket-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { ApprovalTimeline } from "@/app/(portal)/ticket/components/approval-timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { VirtualizationTicketData } from "@/app/(portal)/ticket/components/virtualization-ticket-data";
import { PermissionTicketData } from "@/app/(portal)/ticket/components/permission-ticket-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/loading";

interface ApprovalCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApprovalCenterSheet({
  open,
  onOpenChange,
}: ApprovalCenterSheetProps) {
  const [ticketData, setTicketData] = useState<TicketListResponse | null>(
    null
  );
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<GetTicketsParams>({
    page: 1,
    size: 20,
    status: "pending",
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");

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

  // 获取审批列表
  const fetchTickets = async (params: GetTicketsParams) => {
    setIsLoadingTickets(true);
    try {
      const data = await getTicketsAction(params);
      setTicketData(data);
      setCurrentPage(params.page || 1);
    } catch (err) {
      console.error("获取审批列表失败:", err);
      toast.error("获取审批列表失败", {
        description: err instanceof Error ? err.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // 当 Sheet 打开时重置状态并获取数据
  useEffect(() => {
    if (open) {
      setSearch("");
      setStatus("pending");
      setCurrentPage(1);
      const params: GetTicketsParams = {
        page: 1,
        size: 20,
        status: "pending",
      };
      setSearchParams(params);
      fetchTickets(params);
    }
  }, [open]);

  // 搜索和筛选变化时重新获取数据
  useEffect(() => {
    if (!open) return;
    
    const timeoutId = setTimeout(() => {
      const params: GetTicketsParams = {
        page: 1,
        size: 20,
        ...(search && { title: search }),
        ...(status && status !== "all" && { status }),
      };
      setSearchParams(params);
      fetchTickets(params);
    }, search ? 500 : 0); // 搜索时防抖

    return () => clearTimeout(timeoutId);
  }, [search, status, open]);

  // 获取审批详情和工单详情
  const fetchDetailData = async (ticketId: string) => {
    setIsLoadingApproval(true);
    setApprovalError(null);
    try {
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
      fetchTickets(searchParams);
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

    setIsApproving(true);
    try {
      await submitApprovalAction(currentTicketId, approvalComment);
      toast.success("审批通过", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setApproveDialogOpen(false);
      setIsDetailOpen(false);
      fetchTickets(searchParams);
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

    setIsRejecting(true);
    try {
      await rollbackApprovalAction(currentTicketId, 0, rejectComment);
      toast.success("已驳回", {
        icon: <XCircle className="h-4 w-4" />,
      });
      setRejectDialogOpen(false);
      setIsDetailOpen(false);
      fetchTickets(searchParams);
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

  const handlePageChange = (page: number) => {
    const newParams = { ...searchParams, page };
    setSearchParams(newParams);
    fetchTickets(newParams);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto p-6"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">审批中心</SheetTitle>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="搜索标题..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待审批</SelectItem>
                    <SelectItem value="approved">已通过</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
                {(search || status !== "pending") && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSearch("");
                      setStatus("pending");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isLoadingTickets ? (
              <Loading variant="table" rows={10} columns={6} />
            ) : ticketData && ticketData.data.length > 0 ? (
              <>
                <div className="rounded-lg border relative">
                  <TicketTable
                    tickets={ticketData.data}
                    onDeleteClick={handleDeleteClick}
                    onDetailClick={handleDetailClick}
                    isDeleting={isDeleting}
                  />
                </div>

                {ticketData.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              currentPage > 1 &&
                              handlePageChange(currentPage - 1)
                            }
                            style={{
                              pointerEvents:
                                currentPage > 1 ? "auto" : "none",
                              opacity: currentPage > 1 ? 1 : 0.5,
                            }}
                          />
                        </PaginationItem>
                        {(() => {
                          const pages: (number | string)[] = [];
                          const totalPages = ticketData.pages;
                          const showPages = 5;

                          if (totalPages <= showPages + 2) {
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            pages.push(1);
                            let start = Math.max(2, currentPage - 1);
                            let end = Math.min(totalPages - 1, currentPage + 1);

                            if (currentPage <= 3) {
                              end = Math.min(totalPages - 1, showPages - 1);
                            }

                            if (currentPage >= totalPages - 2) {
                              start = Math.max(2, totalPages - showPages + 2);
                            }

                            if (start > 2) {
                              pages.push("ellipsis-start");
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }

                            if (end < totalPages - 1) {
                              pages.push("ellipsis-end");
                            }

                            pages.push(totalPages);
                          }

                          return pages.map((pageNum, index) => {
                            if (typeof pageNum === "string") {
                              return (
                                <PaginationItem key={`${pageNum}-${index}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => handlePageChange(pageNum)}
                                  isActive={pageNum === currentPage}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          });
                        })()}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              currentPage < ticketData.pages &&
                              handlePageChange(currentPage + 1)
                            }
                            style={{
                              pointerEvents:
                                currentPage < ticketData.pages ? "auto" : "none",
                              opacity:
                                currentPage < ticketData.pages ? 1 : 0.5,
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        跳转到
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={ticketData.pages}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const page = parseInt(e.currentTarget.value, 10);
                            if (
                              !isNaN(page) &&
                              page >= 1 &&
                              page <= ticketData.pages
                            ) {
                              handlePageChange(page);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                        placeholder={`1-${ticketData.pages}`}
                        className="w-20 h-9"
                      />
                      <span className="text-sm text-muted-foreground">页</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border p-8 text-center text-muted-foreground">
                暂无审批数据
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 审批详情 Sheet */}
      <Sheet
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
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
                <ApprovalTimeline tasks={approvalData.data[0].tasks} />
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

      {/* 删除确认对话框 */}
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

      {/* 审批确认对话框 */}
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

      {/* 驳回确认对话框 */}
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
    </>
  );
}
