"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { getTickets, getApproval, deleteTicket } from "@/services/ticket";
import type { TicketListResponse, ApprovalResponse } from "@/types/ticket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
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
import {
  TicketSearchFilter,
  type FilterParams,
} from "./components/TicketSearchFilter";
import { ApprovalTimeline } from "./components/ApprovalTimeline";
import { TICKET_TYPE } from "@/types/ticket";
import type { Ticket } from "@/types/ticket";

export default function ApprovalList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filters, setFilters] = useState<FilterParams>({
    search: "",
    status: "pending",
    typeId: "all",
  });
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [data, setData] = useState<TicketListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [approvalData, setApprovalData] = useState<ApprovalResponse | null>(null);
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState<Error | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);


  // 构建查询参数
  const queryParams = useMemo(() => {
    const params: {
      page?: number;
      size?: number;
      title?: string;
      status?: string;
      type_id?: string;
    } = {
      page,
      size: pageSize,
    };

    if (filters.search) {
      params.title = filters.search;
    }

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.typeId !== "all") {
      params.type_id = filters.typeId === "virtualization" ? TICKET_TYPE : filters.typeId;
    }

    return params;
  }, [page, pageSize, filters]);

  // 获取工单列表
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      if (!data) {
        setIsLoading(true);
      }
      try {
        const result = await getTickets(queryParams);
        setData(result);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("未知错误"));
        setIsLoading(false);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  // 获取审批详情
  useEffect(() => {
    if (!selectedApprovalId || !isDetailOpen) {
      setApprovalData(null);
      return;
    }

    const fetchApproval = async () => {
      setIsLoadingApproval(true);
      setApprovalError(null);
      try {
        const result = await getApproval(selectedApprovalId);
        setApprovalData(result);
      } catch (err) {
        setApprovalError(err instanceof Error ? err : new Error("未知错误"));
      } finally {
        setIsLoadingApproval(false);
      }
    };

    fetchApproval();
  }, [selectedApprovalId, isDetailOpen]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 处理过滤条件变化
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1); // 重置到第一页
  };

  // 重置过滤条件
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      typeId: "all",
    });
    setPage(1);
  };

  // 处理删除申请单
  const handleDeleteClick = (ticketId: string) => {
    setDeleteTicketId(ticketId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTicketId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTicket(deleteTicketId);
      toast.success("删除申请单成功", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      setIsDeleteDialogOpen(false);
      setDeleteTicketId(null);
      // 重新获取数据
      setIsFetching(true);
      const result = await getTickets(queryParams);
      setData(result);
      setIsFetching(false);
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

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    if (!data?.pages) return [];
    const pages: (number | string)[] = [];
    const totalPages = data.pages;
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        end = Math.min(totalPages - 1, showPages - 1);
      }

      if (page >= totalPages - 2) {
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

    return pages;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // 处理输入框回车事件
  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const inputPage = parseInt(e.currentTarget.value, 10);
      if (
        !isNaN(inputPage) &&
        inputPage >= 1 &&
        data?.pages &&
        inputPage <= data.pages
      ) {
        handlePageChange(inputPage);
        e.currentTarget.value = "";
      }
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          加载失败: {error instanceof Error ? error.message : "未知错误"}
        </div>
      </div>
    );
  }

  const pageNumbers = getPageNumbers();
  const canGoPrevious = page > 1;
  const canGoNext = data ? page < data.pages : false;

  return (
    <div className="space-y-6">
      <TicketSearchFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="rounded-lg border relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right w-[1%] whitespace-nowrap">创建时间</TableHead>
              <TableHead className="text-right w-[1%] whitespace-nowrap">更新时间</TableHead>
              <TableHead className="text-right w-[1%] whitespace-nowrap">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  初次加载中...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((ticket: Ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell 
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedApprovalId(ticket.id);
                      setIsDetailOpen(true);
                    }}
                  >
                    {ticket.title}
                  </TableCell>
                  <TableCell>{ticket.type_name}</TableCell>
                  <TableCell>
                    {ticket.status || "待审批"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatDate(ticket.created_at)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatDate(ticket.updated_at)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/resources/virtualization/create?ticketId=${ticket.id}`)}
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(ticket.id)}
                        title="删除"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => canGoPrevious && handlePageChange(page - 1)}
                  style={{
                    pointerEvents: canGoPrevious ? "auto" : "none",
                    opacity: canGoPrevious ? 1 : 0.5,
                  }}
                />
              </PaginationItem>

              {pageNumbers.map((pageNum, index) => {
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
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => canGoNext && handlePageChange(page + 1)}
                  style={{
                    pointerEvents: canGoNext ? "auto" : "none",
                    opacity: canGoNext ? 1 : 0.5,
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
              max={data.pages}
              onKeyDown={handlePageInput}
              placeholder={`1-${data.pages}`}
              className="w-20 h-9"
            />
            <span className="text-sm text-muted-foreground">页</span>
          </div>
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="overflow-auto">
          <DialogHeader>
            <DialogTitle>审批详情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingApproval ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : approvalError ? (
              <div className="text-center py-8 text-destructive">
                加载失败: {approvalError instanceof Error ? approvalError.message : "未知错误"}
              </div>
            ) : approvalData && approvalData.data && approvalData.data.length > 0 ? (
                <div className="space-y-4">
                  <ApprovalTimeline tasks={approvalData.data[0].data.tasks} />
                </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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