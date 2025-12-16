"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "../../components/status-badge";
import { Copy, FileText as FileTextIcon } from "lucide-react";
import { toast } from "sonner";
import type { VirtualDisk } from "@/types/vm";

interface DiskTableProps {
  disks: VirtualDisk[];
}

export function DiskTable({ disks }: DiskTableProps) {
  if (!disks || disks.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        暂无磁盘数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>磁盘名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>系统盘</TableHead>
            <TableHead>是否有快照</TableHead>
            <TableHead>大小</TableHead>
            <TableHead>挂载点</TableHead>
            <TableHead>是否删除</TableHead>
            <TableHead>备注</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disks.map((disk) => (
            <TableRow key={disk.id}>
              <TableCell>{disk.name}</TableCell>
              <TableCell>
                <StatusBadge status={disk.status} />
              </TableCell>
              <TableCell>
                <Badge variant={disk.is_sys ? "default" : "secondary"}>
                  {disk.is_sys ? "true" : "false"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={disk.exists_snapshot ? "default" : "secondary"}>
                  {disk.exists_snapshot ? "true" : "false"}
                </Badge>
              </TableCell>
              <TableCell>{disk.size} GB</TableCell>
              <TableCell>
                {disk.mount_point ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(disk.mount_point);
                            toast.success("已复制到剪贴板", {
                              icon: <Copy className="h-4 w-4" />,
                            });
                          } catch {
                            toast.error("复制失败");
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{disk.mount_point}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={disk.is_deleted ? "destructive" : "secondary"}>
                  {disk.is_deleted ? "true" : "false"}
                </Badge>
              </TableCell>
              <TableCell>
                {disk.extra ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <FileTextIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{disk.extra}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

