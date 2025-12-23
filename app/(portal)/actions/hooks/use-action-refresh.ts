"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getActionLogAction } from "@/actions/action";
import type { ActionLog } from "@/types/action";

interface UseActionRefreshOptions {
  actionId: string;
  onStatusChange?: (actionLog: ActionLog) => void;
  interval?: number; // 刷新间隔，默认 2 秒
}

export function useActionRefresh({
  actionId,
  onStatusChange,
  interval = 2000,
}: UseActionRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentActionLog, setCurrentActionLog] = useState<ActionLog | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);

  const stopRefresh = useCallback(() => {
    setIsRefreshing(false);
    isCancelledRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRefresh = useCallback(async () => {
    if (!actionId) return;

    // 先清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRefreshing(true);
    isCancelledRef.current = false;

    const fetchActionLog = async () => {
      if (isCancelledRef.current) {
        return;
      }

      try {
        console.log(`[useActionRefresh] 调用 getActionLogAction，actionId: ${actionId}`);
        const response = await getActionLogAction(actionId);
        console.log(`[useActionRefresh] getActionLogAction 响应:`, response);
        if (response?.data) {
          const actionLog = response.data;
          setCurrentActionLog(actionLog);
          onStatusChange?.(actionLog);

          // 如果状态不是 RUNNING，自动停止刷新
          if (actionLog.status !== "RUNNING") {
            stopRefresh();
            return;
          }
        }
      } catch (error) {
        console.error("获取操作日志失败:", error);
        // 发生错误时也停止刷新
        stopRefresh();
        return;
      }
    };

    // 立即执行一次
    await fetchActionLog();

    // 如果已取消，不再设置定时器
    if (isCancelledRef.current) {
      return;
    }

    // 设置定时刷新
    intervalRef.current = setInterval(async () => {
      if (isCancelledRef.current) {
        return;
      }
      await fetchActionLog();
    }, interval);
  }, [actionId, interval, onStatusChange, stopRefresh]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopRefresh();
    };
  }, [stopRefresh]);

  return {
    isRefreshing,
    currentActionLog,
    startRefresh,
    stopRefresh,
  };
}

