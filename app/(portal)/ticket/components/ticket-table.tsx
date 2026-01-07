"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Ticket } from "@/types/ticket";

interface TicketTableProps {
  tickets: Ticket[];
  onDeleteClick: (ticketId: string) => void;
  onDetailClick: (ticketId: string) => void;
  isDeleting?: boolean;
}

export function TicketTable({
  tickets,
  onDeleteClick,
  onDetailClick,
  isDeleting = false,
}: TicketTableProps) {
  const router = useRouter();

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

  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return "待审批";
    
    const statusMap: Record<string, string> = {
      pending: "审批中",
      in_progress: "执行中",
      completed: "已完成",
      canceled: "已取消",
      cancled: "已取消", // 兼容拼写错误
      on_hold: "已挂起",
    };

    return statusMap[status] || status;
  };

  if (tickets.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right w-[1%] whitespace-nowrap">
              创建时间
            </TableHead>
            <TableHead className="text-right w-[1%] whitespace-nowrap">
              更新时间
            </TableHead>
            <TableHead className="text-right w-[1%] whitespace-nowrap">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
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
          <TableHead>标题</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead className="text-right w-[1%] whitespace-nowrap">
            创建时间
          </TableHead>
          <TableHead className="text-right w-[1%] whitespace-nowrap">
            更新时间
          </TableHead>
          <TableHead className="text-right w-[1%] whitespace-nowrap">
            操作
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell
              className="font-medium cursor-pointer hover:underline"
              onClick={() => onDetailClick(ticket.id)}
            >
              {ticket.title}
            </TableCell>
            <TableCell>{ticket.type_name}</TableCell>
            <TableCell>{getStatusLabel(ticket.status)}</TableCell>
            <TableCell className="text-right whitespace-nowrap">
              {formatDate(ticket.created_at)}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
              {formatDate(ticket.updated_at)}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    router.push(
                      `/resources/virtualization/create?ticketId=${ticket.id}`
                    )
                  }
                  title="编辑"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDeleteClick(ticket.id)}
                  title="删除"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
