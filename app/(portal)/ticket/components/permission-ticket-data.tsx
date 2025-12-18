"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Ticket } from "@/types/ticket";

interface PermissionTicketDataProps {
  ticket: Ticket;
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

interface PermissionChange {
  permission: string;
  status: boolean;
}

interface PermissionTicketData {
  vmId?: string;
  vmName?: string;
  vmHostname?: string;
  vmAddress?: string;
  originalPermissions?: Record<string, boolean>;
  pendingChanges?: Record<string, boolean>;
  finalPermissions?: Record<string, boolean>;
  changes?: PermissionChange[];
}

export function PermissionTicketData({
  ticket,
}: PermissionTicketDataProps) {
  const ticketData = ticket.data as PermissionTicketData;

  // 获取所有权限变更
  const changes = ticketData.changes || [];
  
  // 如果没有变更列表，尝试从 pendingChanges 构建
  const permissionChanges = changes.length > 0
    ? changes
    : ticketData.pendingChanges
    ? Object.entries(ticketData.pendingChanges).map(([permission, status]) => ({
        permission,
        status,
      }))
    : [];

  return (
    <div className="space-y-4">
      {/* 权限变更列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">权限申请</CardTitle>
        </CardHeader>
        <CardContent>
          {permissionChanges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {permissionChanges.map((change) => {
                const label = PERMISSION_LABELS[change.permission] || change.permission;
                return (
                  <div
                    key={change.permission}
                    className="flex items-center gap-2 p-2 rounded border"
                  >
                    {change.status ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span className="text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">暂无权限变更信息</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 原始权限状态（如果有） */}
      {ticketData.originalPermissions &&
        Object.keys(ticketData.originalPermissions).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">原始权限状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(ticketData.originalPermissions).map(
                  ([permission, status]) => {
                    const label = PERMISSION_LABELS[permission] || permission;
                    return (
                      <div
                        key={permission}
                        className="flex items-center gap-2 p-2 rounded border"
                      >
                        {status ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                        <span className="text-sm">{label}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

