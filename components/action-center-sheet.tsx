"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { getActionLogsAction } from "@/actions/action";
import type {
  ActionLogListResponse,
  ActionLog,
  GetActionLogsParams,
} from "@/types/action";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ActionTable } from "@/app/(portal)/actions/components/action-table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/loading";
import { useActionRefresh } from "@/app/(portal)/actions/hooks/use-action-refresh";

interface ActionCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActionCenterSheet({
  open,
  onOpenChange,
}: ActionCenterSheetProps) {
  const [actionData, setActionData] = useState<ActionLogListResponse | null>(
    null
  );
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<GetActionLogsParams>({
    page: 1,
    size: 20,
    status: "RUNNING",
  });
  const [searchType, setSearchType] = useState<"service" | "target">("service");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("RUNNING");
  const [items, setItems] = useState<ActionLog[]>([]);
  const [refreshingActionId, setRefreshingActionId] = useState<string | null>(null);

  // 获取操作记录列表
  const fetchActions = async (params: GetActionLogsParams) => {
    setIsLoadingActions(true);
    try {
      const data = await getActionLogsAction(params);
      setActionData(data);
      setCurrentPage(params.page || 1);
      setItems(data.data?.items || []);
    } catch (err) {
      console.error("获取操作记录失败:", err);
      toast.error("获取操作记录失败", {
        description: err instanceof Error ? err.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoadingActions(false);
    }
  };

  // 当刷新任务获取到新状态时，更新列表中的数据
  const handleStatusChange = useCallback((actionLog: ActionLog) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === actionLog.id ? actionLog : item
      )
    );
    
    // 如果状态不是 RUNNING，自动停止刷新
    if (actionLog.status !== "RUNNING" && refreshingActionId === actionLog.id) {
      setRefreshingActionId(null);
    }
  }, [refreshingActionId]);

  const {
    startRefresh,
    stopRefresh,
  } = useActionRefresh({
    actionId: refreshingActionId || "",
    onStatusChange: handleStatusChange,
    interval: 2000,
  });

  // 当 refreshingActionId 变化时，启动或停止刷新
  useEffect(() => {
    if (refreshingActionId) {
      startRefresh();
    } else {
      stopRefresh();
    }
  }, [refreshingActionId, startRefresh, stopRefresh]);

  // 当 Sheet 打开时重置状态并获取数据
  useEffect(() => {
    if (open) {
      setSearch("");
      setSearchType("service");
      setStatus("RUNNING");
      setCurrentPage(1);
      const params: GetActionLogsParams = {
        page: 1,
        size: 20,
        status: "RUNNING",
      };
      setSearchParams(params);
      fetchActions(params);
    }
  }, [open]);

  // 搜索和筛选变化时重新获取数据
  useEffect(() => {
    if (!open) return;
    
    const timeoutId = setTimeout(() => {
      const params: GetActionLogsParams = {
        page: 1,
        size: 20,
        ...(search && searchType === "service" && { service: search }),
        ...(search && searchType === "target" && { target: search }),
        ...(status && status !== "all" && { status }),
      };
      setSearchParams(params);
      fetchActions(params);
    }, search ? 500 : 0); // 搜索时防抖

    return () => clearTimeout(timeoutId);
  }, [search, searchType, status, open]);

  const handleActionDoubleClick = useCallback(
    (action: ActionLog) => {
      // 如果已经在刷新这个 action，则不做任何操作
      if (refreshingActionId === action.id) {
        return;
      }

      // 如果状态不是 RUNNING，不需要刷新
      if (action.status !== "RUNNING") {
        return;
      }

      // 开始刷新
      setRefreshingActionId(action.id);
    },
    [refreshingActionId]
  );

  const handleCancelRefresh = useCallback(() => {
    stopRefresh();
    setRefreshingActionId(null);
  }, [stopRefresh]);

  const handlePageChange = (page: number) => {
    const newParams = { ...searchParams, page };
    setSearchParams(newParams);
    fetchActions(newParams);
  };

  const handleReset = () => {
    setSearch("");
    setSearchType("service");
    setStatus("RUNNING");
  };

  const hasActiveFilters = search || status !== "RUNNING";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto p-6"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">操作记录</SheetTitle>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Select
                  value={searchType}
                  onValueChange={(value: "service" | "target") => setSearchType(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">搜索服务</SelectItem>
                    <SelectItem value="target">搜索目标</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={
                      searchType === "service"
                        ? "搜索服务..."
                        : "搜索目标..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="RUNNING">运行中</SelectItem>
                  <SelectItem value="SUCCESS">成功</SelectItem>
                  <SelectItem value="FAILED">失败</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {isLoadingActions ? (
            <Loading variant="table" rows={10} columns={8} />
          ) : actionData && items.length > 0 ? (
            <>
              <div className="rounded-lg border relative">
                <ActionTable
                  actions={items}
                  refreshingActionId={refreshingActionId}
                  onActionDoubleClick={handleActionDoubleClick}
                  onCancelRefresh={handleCancelRefresh}
                />
              </div>

              {actionData.data.pages > 1 && (
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
                        const totalPages = actionData.data.pages;
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
                            currentPage < actionData.data.pages &&
                            handlePageChange(currentPage + 1)
                          }
                          style={{
                            pointerEvents:
                              currentPage < actionData.data.pages ? "auto" : "none",
                            opacity:
                              currentPage < actionData.data.pages ? 1 : 0.5,
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
                      max={actionData.data.pages}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const page = parseInt(e.currentTarget.value, 10);
                          if (
                            !isNaN(page) &&
                            page >= 1 &&
                            page <= actionData.data.pages
                          ) {
                            handlePageChange(page);
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                      placeholder={`1-${actionData.data.pages}`}
                      className="w-20 h-9"
                    />
                    <span className="text-sm text-muted-foreground">页</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              暂无操作记录
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
