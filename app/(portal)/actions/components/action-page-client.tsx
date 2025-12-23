"use client";

import React, { Suspense, useState, useCallback, useEffect } from "react";
import { ActionSearchFilterClient } from "./action-search-filter-client";
import { ActionTable } from "./action-table";
import { ActionPaginationClient } from "./action-pagination-client";
import { useActionRefresh } from "../hooks/use-action-refresh";
import type { ActionLogListResponse, ActionLog } from "@/types/action";

interface ActionPageClientProps {
  data: ActionLogListResponse;
  currentPage: number;
}

export function ActionPageClient({
  data,
  currentPage,
}: ActionPageClientProps) {
  const actionList = data.data;
  const [items, setItems] = useState<ActionLog[]>(actionList?.items || []);
  const [refreshingActionId, setRefreshingActionId] = useState<string | null>(null);
  const pages = actionList?.pages || 0;

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

  // 当 refreshingActionId 变化时，启动或停止刷新
  useEffect(() => {
    if (refreshingActionId) {
      startRefresh();
    } else {
      stopRefresh();
    }
  }, [refreshingActionId, startRefresh, stopRefresh]);

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
        <ActionSearchFilterClient />
      </Suspense>

      <div className="rounded-lg border relative">
        <ActionTable
          actions={items}
          refreshingActionId={refreshingActionId}
          onActionDoubleClick={handleActionDoubleClick}
          onCancelRefresh={handleCancelRefresh}
        />
      </div>

      {pages > 1 && (
        <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
          <ActionPaginationClient
            currentPage={currentPage}
            totalPages={pages}
          />
        </Suspense>
      )}
    </div>
  );
}

