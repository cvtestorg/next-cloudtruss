"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VIRTUAL_MACHINE_PERMISSIONS } from "@/config/permissions";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { createTicketAction } from "@/actions/ticket";
import { TICKET_TYPE_PERMISSION } from "@/types/ticket";
import type { VirtualMachineItem } from "@/types/vm";

interface PermRequestProps {
  vmId: string;
  vm: VirtualMachineItem;
  userAllowed: Record<string, boolean>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 权限中文名称映射
const PERMISSION_LABELS: Record<string, string> = {
  can_read: "查看虚拟机",
  can_start: "开机",
  can_shutdown: "关机",
  can_restart: "重启",
  can_suspend: "挂起",
  can_add_disk: "新增磁盘",
  can_expand: "CPU/内存扩容",
  can_rename: "重命名",
  can_recycle: "资源回收",
  can_archive: "资源归档",
  can_transfer: "过户",
  can_renew: "续期",
  can_change_purpose: "用途变更",
  can_bind_project: "绑定项目",
  can_sync: "手动同步",
  can_set_role: "角色设置",
  can_create_snapshot: "创建快照",
  can_restore_snapshot: "恢复快照",
  can_delete_snapshot: "删除快照",
  can_manage_tags: "管理标签",
  can_classify: "分类资源",
  can_request_approval: "申请审批",
};

// 权限说明文档映射
const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  can_read: "查看虚拟机的详细信息, 包括配置、状态、资源使用情况等",
  can_start: "启动处于关闭状态的虚拟机",
  can_shutdown: "正常关闭虚拟机, 系统会执行正常的关机流程",
  can_restart: "重启虚拟机, 系统会先关闭再启动虚拟机",
  can_suspend: "挂起虚拟机, 暂停虚拟机的运行状态",
  can_add_disk: "为虚拟机添加新的磁盘存储",
  can_expand: "增加虚拟机的 CPU 核心数或内存容量",
  can_rename: "修改虚拟机的名称",
  can_recycle: "将虚拟机移入回收站, 可恢复或永久删除",
  can_archive: "归档虚拟机, 用于长期存储不常用的资源",
  can_transfer: "将虚拟机的所有权转移给其他用户",
  can_renew: "延长虚拟机的使用期限",
  can_change_purpose: "修改虚拟机的用途说明和分类",
  can_bind_project: "将虚拟机绑定到指定项目",
  can_sync: "手动同步虚拟机的状态和配置信息",
  can_set_role: "设置虚拟机的角色和权限配置",
  can_create_snapshot: "创建虚拟机快照, 用于备份和恢复",
  can_restore_snapshot: "从快照恢复虚拟机的状态",
  can_delete_snapshot: "删除不再需要的快照",
  can_manage_tags: "添加、修改或删除虚拟机的标签",
  can_classify: "对虚拟机进行分类和标记",
  can_request_approval: "提交权限申请, 需要经过审批流程",
};

export function PermRequest({
  vmId,
  vm,
  userAllowed,
  open,
  onOpenChange,
}: PermRequestProps) {
  // 跟踪权限变更: Record<permission, newValue | null>
  // null 表示恢复原始状态（取消变更）
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, boolean | null>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取权限的当前显示状态（原始值 + 待提交的变更）
  const getCurrentPermissionValue = (permission: string): boolean => {
    if (pendingChanges[permission] !== undefined) {
      // 如果有待提交的变更，使用变更后的值
      // null 表示恢复原始状态
      return pendingChanges[permission] ?? userAllowed[permission] ?? false;
    }
    // 否则使用原始值
    return userAllowed[permission] ?? false;
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setPendingChanges((prev) => {
      const originalValue = userAllowed[permission] ?? false;
      const newChanges = { ...prev };

      if (checked === originalValue) {
        // 如果切换回原始值，移除变更记录
        delete newChanges[permission];
      } else {
        // 否则记录变更
        newChanges[permission] = checked;
      }

      return newChanges;
    });
  };

  const handleSubmit = async () => {
    // 收集所有变更
    const changes = Object.entries(pendingChanges)
      .filter((entry) => entry[1] !== null)
      .map(([permission, value]) => ({
        permission,
        status: value,
      }));

    if (changes.length === 0) {
      // 没有变更，直接关闭
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // 构建完整的表单数据
      const formData = {
        vmId,
        // 原始权限状态
        originalPermissions: userAllowed,
        // 待提交的变更
        pendingChanges: Object.fromEntries(
          Object.entries(pendingChanges).filter(([, value]) => value !== null)
        ),
        // 变更后的完整权限状态
        finalPermissions: VIRTUAL_MACHINE_PERMISSIONS.reduce(
          (acc, permission) => {
            acc[permission] = getCurrentPermissionValue(permission);
            return acc;
          },
          {} as Record<string, boolean>
        ),
        // 变更列表（用于提交）
        changes,
      };

      // 打印完整的表单数据
      console.log("=== 权限申请表单数据 ===");
      console.log(JSON.stringify(formData, null, 2));
      console.log("========================");

      // 构建工单标题
      const permissionLabels = changes
        .map((change) => PERMISSION_LABELS[change.permission] || change.permission)
        .join("、");
      const title = `申请虚拟机权限 - ${vm.name || vmId} (${permissionLabels})`;

      // 调用 Server Action 创建工单
      const ticketResponse = await createTicketAction({
        type_id: TICKET_TYPE_PERMISSION,
        title,
        data: {
          vmId,
          vmName: vm.name,
          vmHostname: vm.hostname,
          vmAddress: vm.address,
          // 原始权限状态
          originalPermissions: userAllowed,
          // 待提交的变更
          pendingChanges: Object.fromEntries(
            Object.entries(pendingChanges).filter(([, value]) => value !== null)
          ),
          // 变更后的完整权限状态
          finalPermissions: VIRTUAL_MACHINE_PERMISSIONS.reduce(
            (acc, permission) => {
              acc[permission] = getCurrentPermissionValue(permission);
              return acc;
            },
            {} as Record<string, boolean>
          ),
          // 变更列表（用于提交）
          changes,
        },
      });

      // 调试：打印响应结构
      console.log("=== 创建工单响应 ===");
      console.log(JSON.stringify(ticketResponse, null, 2));
      console.log("====================");

      // 处理响应：API 可能返回不同的格式
      // 如果响应有 data 字段（类似 TicketDetailResponse），则从 data 中获取 id
      // 否则直接使用响应中的 id
      const ticketId = 
        (ticketResponse as { data?: { id?: string }; id?: string })?.data?.id || 
        (ticketResponse as { id?: string })?.id || 
        ticketResponse.id;

      // 成功后清空变更记录并关闭 Sheet
      setPendingChanges({});
      onOpenChange(false);

      toast.success("权限申请提交成功", {
        description: ticketId 
          ? `工单已创建：${title} (ID: ${ticketId})`
          : `工单已创建：${title}`,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("权限申请失败:", error);
      toast.error("权限申请提交失败", {
        description: error instanceof Error ? error.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 将权限分组显示
  const permissionsWithStatus = VIRTUAL_MACHINE_PERMISSIONS.map(
    (permission) => ({
      key: permission,
      label: PERMISSION_LABELS[permission] || permission,
      description: PERMISSION_DESCRIPTIONS[permission] || "",
      currentValue: getCurrentPermissionValue(permission),
      hasPendingChange: pendingChanges[permission] !== undefined,
    })
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">权限申请</SheetTitle>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(pendingChanges).length === 0}
              className="h-6 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  提交申请
                </>
              )}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {permissionsWithStatus.map(
              ({ key, label, description, currentValue, hasPendingChange }) => {
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between rounded-md border p-2 hover:bg-accent/50 transition-colors ${
                      hasPendingChange ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      {description ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm font-medium leading-snug">
                              {label}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>{description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="text-sm font-medium leading-snug">
                          {label}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <Switch
                        checked={currentValue}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(key, checked)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
