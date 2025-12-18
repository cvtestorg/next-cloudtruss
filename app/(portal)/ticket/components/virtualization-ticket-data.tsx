"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { convertTicketDataToFormData } from "@/lib/vm/create-utils";
import type { Ticket } from "@/types/ticket";

interface VirtualizationTicketDataProps {
  ticket: Ticket;
}

// 环境标签映射
const ENV_LABELS: Record<string, string> = {
  prod: "生产环境",
  test: "测试环境",
  dev: "开发环境",
};

// 操作系统标签映射
const OS_LABELS: Record<string, string> = {
  ubuntu24: "Ubuntu 24.04",
  ubuntu22: "Ubuntu 22.04",
  ubuntu20: "Ubuntu 20.04",
  centos7: "CentOS 7",
  centos8: "CentOS 8",
  windows2016: "Windows 2016",
};

// 类型标签映射
const TYPE_LABELS: Record<string, string> = {
  hybrid: "混合 VM",
  allflash: "全闪 VM",
};

export function VirtualizationTicketData({
  ticket,
}: VirtualizationTicketDataProps) {
  const formData = convertTicketDataToFormData(ticket.data);

  return (
    <div className="space-y-4">
      {/* 公共信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">公共信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">隶属产品</p>
              <p className="text-sm font-medium">{formData.common.product || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">过期时间</p>
              <p className="text-sm font-medium">
                {formData.common.expiryDate
                  ? new Date(formData.common.expiryDate).toLocaleDateString("zh-CN")
                  : "-"}
              </p>
            </div>
            {formData.common.proxyApplicant && (
              <div>
                <p className="text-sm text-muted-foreground">代申请人</p>
                <p className="text-sm font-medium">{formData.common.proxyApplicant}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 主机信息列表 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">主机信息</h3>
        {formData.hosts.map((host, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  主机 {index + 1}: {host.hostname || `未命名主机 ${index + 1}`}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {ENV_LABELS[host.env] || host.env}
                  </Badge>
                  <Badge variant="outline">
                    {OS_LABELS[host.os] || host.os}
                  </Badge>
                  <Badge variant="outline">
                    {TYPE_LABELS[host.type] || host.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">主机名</p>
                  <p className="text-sm font-medium">{host.hostname || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">角色</p>
                  <p className="text-sm font-medium">{host.role || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPU</p>
                  <p className="text-sm font-medium">{host.cpu || "-"} 核</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">内存</p>
                  <p className="text-sm font-medium">{host.memory || "-"} GB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">磁盘</p>
                  <p className="text-sm font-medium">{host.disk || "-"} GB</p>
                </div>
                {host.ipAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">IP 地址</p>
                    <p className="text-sm font-medium">{host.ipAddress}</p>
                  </div>
                )}
                {host.cluster && (
                  <div>
                    <p className="text-sm text-muted-foreground">集群</p>
                    <p className="text-sm font-medium">{host.cluster}</p>
                  </div>
                )}
                {host.template && (
                  <div>
                    <p className="text-sm text-muted-foreground">模板</p>
                    <p className="text-sm font-medium">{host.template}</p>
                  </div>
                )}
                {host.vlan && (
                  <div>
                    <p className="text-sm text-muted-foreground">VLAN</p>
                    <p className="text-sm font-medium">{host.vlan}</p>
                  </div>
                )}
                {host.description && (
                  <div className="col-span-full">
                    <p className="text-sm text-muted-foreground">描述</p>
                    <p className="text-sm font-medium">{host.description}</p>
                  </div>
                )}
                {host.notes && (
                  <div className="col-span-full">
                    <p className="text-sm text-muted-foreground">备注</p>
                    <p className="text-sm font-medium">{host.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

