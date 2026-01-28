"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "../../components/status-badge";
import { Copy, CalendarPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { VirtualDisk } from "@/types/vm";
import { createActionLogAction } from "@/actions/action";

interface DiskTableProps {
  disks: VirtualDisk[];
  vmId: string;
  vmName: string;
}

export function DiskTable({ disks, vmId, vmName }: DiskTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diskToDelete, setDiskToDelete] = useState<VirtualDisk | null>(null);
  const [expandDialogOpen, setExpandDialogOpen] = useState(false);
  const [diskToExpand, setDiskToExpand] = useState<VirtualDisk | null>(null);
  const [expandSize, setExpandSize] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleDiskAction = async (
    action: "expdisk" | "deldisk",
    disk: VirtualDisk,
    expandSizeGB?: number,
    description?: string,
    notes?: string
  ) => {
    // 防止重复操作
    if (isProcessing === disk.id) {
      return;
    }

    setIsProcessing(disk.id);

    try {
      await createActionLogAction({
        service: "virtualization",
        action: action,
        target: `${vmName} - ${disk.name}`,
        target_id: disk.id,
        data: {
          vm_id: vmId,
          vm_name: vmName,
          disk_id: disk.id,
          disk_name: disk.name,
          disk_size: disk.size,
          disk_status: disk.status,
          is_sys: disk.is_sys,
          ...(action === "expdisk" && expandSizeGB !== undefined && {
            expand_size_gb: expandSizeGB,
            new_disk_size: disk.size + expandSizeGB,
            ...(description && { description }),
            ...(notes && { notes }),
          }),
        },
      });
      toast.success("操作成功，不要重复操作");
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志失败:", error);
      toast.error("操作失败，请稍后重试");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteClick = (disk: VirtualDisk) => {
    setDiskToDelete(disk);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!diskToDelete) {
      return;
    }
    setDeleteDialogOpen(false);
    await handleDiskAction("deldisk", diskToDelete);
    setDiskToDelete(null);
  };

  const handleExpandClick = (disk: VirtualDisk) => {
    setDiskToExpand(disk);
    setExpandSize("");
    setDescription("");
    setNotes("");
    setExpandDialogOpen(true);
  };

  const handleExpandConfirm = async () => {
    if (!diskToExpand) {
      return;
    }

    const size = parseFloat(expandSize);
    if (isNaN(size) || size < 50 || size > 500) {
      toast.error("扩容大小必须在 50-500GB 之间，且为 50 的倍数");
      return;
    }
    if (size % 50 !== 0) {
      toast.error("扩容大小必须为 50GB 的倍数");
      return;
    }

    setExpandDialogOpen(false);
    await handleDiskAction("expdisk", diskToExpand, size, description, notes);
    setDiskToExpand(null);
    setExpandSize("");
    setDescription("");
    setNotes("");
  };

  const currentDiskSize = diskToExpand?.size || 0;
  const expandSizeNum = parseFloat(expandSize) || 0;
  const newDiskSize = currentDiskSize + expandSizeNum;

  if (!disks || disks.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        暂无磁盘数据
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除磁盘</AlertDialogTitle>
            <AlertDialogDescription>
              确定要回收磁盘 <strong>{diskToDelete?.name}</strong> 吗？此操作将创建磁盘回收操作动作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={expandDialogOpen} onOpenChange={setExpandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>磁盘扩容</DialogTitle>
            <DialogDescription>
              为磁盘 <strong>{diskToExpand?.name}</strong> 设置扩容大小
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-size">扩容前大小</Label>
                <Input
                  id="current-size"
                  type="number"
                  disabled
                  value={currentDiskSize}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expand-size">扩容大小 (GB)</Label>
                <Input
                  id="expand-size"
                  type="number"
                  min="50"
                  max="500"
                  step="50"
                  placeholder="请输入扩容大小（50-500GB，步长50GB）"
                  value={expandSize}
                  onChange={(e) => setExpandSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-size">扩容后大小</Label>
                <Input
                  id="new-size"
                  type="number"
                  disabled
                  value={expandSizeNum > 0 ? newDiskSize : ""}
                  placeholder="-"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">用途描述</Label>
                <Textarea
                  id="description"
                  placeholder="用途描述展示在堡垒机"
                  className="resize-none"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">注意事项</Label>
                <Textarea
                  id="notes"
                  placeholder="给资源管理员的悄悄话"
                  className="resize-none"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExpandDialogOpen(false);
                setDiskToExpand(null);
                setExpandSize("");
                setDescription("");
                setNotes("");
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleExpandConfirm}
              disabled={
                !expandSize ||
                expandSizeNum < 50 ||
                expandSizeNum > 500 ||
                expandSizeNum % 50 !== 0
              }
            >
              确认扩容
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            <TableHead>操作</TableHead>
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
                {!disk.is_sys ? (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleExpandClick(disk)}
                          disabled={isProcessing === disk.id}
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>扩容</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteClick(disk)}
                          disabled={isProcessing === disk.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>删除</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </>
  );
}

