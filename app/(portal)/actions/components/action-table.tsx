"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Orbit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionLog } from "@/types/action";

interface ActionTableProps {
  actions?: ActionLog[];
  refreshingActionId?: string | null;
  onActionDoubleClick?: (action: ActionLog) => void;
  onCancelRefresh?: (actionId: string) => void;
}

export function ActionTable({
  actions = [],
  refreshingActionId,
  onActionDoubleClick,
  onCancelRefresh,
}: ActionTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (createdAt: string, updatedAt: string) => {
    try {
      const created = new Date(createdAt).getTime();
      const updated = new Date(updatedAt).getTime();
      const diff = updated - created;

      if (diff < 0) return "-";

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days}天${hours % 24}小时${minutes % 60}分钟`;
      } else if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`;
      } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`;
      } else {
        return `${seconds}秒`;
      }
    } catch {
      return "-";
    }
  };

  if (!actions || actions.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>服务</TableHead>
            <TableHead>操作类型</TableHead>
            <TableHead>目标</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right w-[1%] whitespace-nowrap">
              创建时间
            </TableHead>
            <TableHead className="text-right w-[1%] whitespace-nowrap">
              更新时间
            </TableHead>
            <TableHead className="text-right w-[120px] whitespace-nowrap">
              耗时
            </TableHead>
            <TableHead className="text-center w-[60px] whitespace-nowrap">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              暂无数据
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>服务</TableHead>
          <TableHead>操作类型</TableHead>
          <TableHead>目标</TableHead>
          <TableHead>状态</TableHead>
          <TableHead className="text-right w-[1%] whitespace-nowrap">
            创建时间
          </TableHead>
          <TableHead className="text-right w-[1%] whitespace-nowrap">
            更新时间
          </TableHead>
          <TableHead className="text-right w-[120px] whitespace-nowrap">
            耗时
          </TableHead>
          <TableHead className="text-center w-[60px] whitespace-nowrap">
            操作
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actions.map((action) => {
          const isRefreshing = refreshingActionId === action.id;
          return (
            <TableRow
              key={action.id}
              onDoubleClick={() => onActionDoubleClick?.(action)}
              className={cn(
                "cursor-pointer transition-colors",
                isRefreshing && "action-refreshing-row"
              )}
            >
              <TableCell className="font-medium">
                {action.service}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{action.action}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {action.target || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    action.status === "SUCCESS"
                      ? "default"
                      : action.status === "FAILED"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {action.status === "RUNNING"
                    ? "运行中"
                    : action.status === "SUCCESS"
                    ? "成功"
                    : action.status === "FAILED"
                    ? "失败"
                    : action.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatDate(action.created_at)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatDate(action.updated_at)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap w-[120px]">
                {calculateDuration(action.created_at, action.updated_at)}
              </TableCell>
              <TableCell className="text-center whitespace-nowrap w-[60px]">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6",
                    isRefreshing && "text-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (isRefreshing) {
                      onCancelRefresh?.(action.id);
                    } else {
                      onActionDoubleClick?.(action);
                    }
                  }}
                  title={isRefreshing ? "取消刷新" : "开始刷新"}
                  disabled={!isRefreshing && action.status !== "RUNNING"}
                >
                  <Orbit className={cn(
                    "h-3 w-3",
                    isRefreshing && "animate-spin"
                  )} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

