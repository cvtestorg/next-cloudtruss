import { notFound } from "next/navigation";
import { getVirtualMachineDetailAction } from "@/actions/vm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, ArrowLeft } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { PowerStatusBadge } from "../components/PowerStatusBadge";
import { VmDetailActions } from "./components/VmDetailActions";
import { VmDetailTabs } from "./components/VmDetailTabs";
import Link from "next/link";
import { fgaClient } from "@/lib/openfga";
import { getCurrentUserAction } from "@/actions/user";
import { VIRTUAL_MACHINE_PERMISSIONS } from "@/config/permissions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VirtualMachineDetail({ params }: PageProps) {
  const { id } = await params;

  /* 如果 id 不存在，则返回 404 */
  if (!id) {
    notFound();
  }

  /* 获取虚拟机详情 */
  const data = await getVirtualMachineDetailAction(id);

  /* 如果数据不存在，则返回 404 */
  if (!data?.data) {
    notFound();
  }

  /* 获取当前登录的用户信息 */
  const currentUser = await getCurrentUserAction();
  // console.log(currentUser.data?.id);

  /* 获取权限数据 */
  const check_permissions = VIRTUAL_MACHINE_PERMISSIONS.map((permission: string) => ({
    user: `user:${currentUser.data?.id}`,
    relation: permission,
    object: `virtual_machine:${id}`,
  }));
  const { result } = await fgaClient.batchCheck({ checks: check_permissions });
  // 解析权限结果为字典
  // 优化：使用 Object.fromEntries 使代码更简洁高效
  const userAllowed = Object.fromEntries(
    result.map(item => [item.request.relation, item.allowed])
  );
  // console.log(userAllowed);

  const vm = data.data;
  const disks = vm.disk || [];
  const networks = vm.network || [];

  return (
    <div className="space-y-6">
      {/* 顶部标题和操作栏 */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Link href="/resources/virtualization">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Monitor className="h-14 w-14 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{vm.name}</h1>
              <PowerStatusBadge powerStatus={vm.power_status} />
            </div>
            {vm.description && (
              <div className="text-sm text-muted-foreground">
                描述：{vm.description}
              </div>
            )}
          </div>
        </div>
        <VmDetailActions vm={vm} userAllowed={userAllowed} />
      </div>

      {/* 资源信息和服务信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 资源信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">资源信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">主机名称:</span>
                <span className="font-medium">{vm.hostname}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">内存 (GB):</span>
                <span className="font-medium">{vm.memory}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">IP 地址:</span>
                <span className="font-medium">{vm.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">CPU(核):</span>
                <span className="font-medium">{vm.cpu}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">所有者:</span>
                <span className="font-medium">{vm.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">状态:</span>
                <StatusBadge status={vm.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 服务信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">服务信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">产品线:</span>
                <span className="font-medium">{vm.application}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">产品:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">集群:</span>
                <Badge variant="outline">{vm.vcluster}</Badge>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">虚拟机类型:</span>
                <span className="font-medium">
                  {vm.is_flash ? "闪电VM" : "混合VM"}
                </span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">数据权限:</span>
                <span className="font-medium">{vm.iam ? "是" : "否"}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">环境:</span>
                <span className="font-medium">{vm.env}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">角色:</span>
                <span className="font-medium">{vm.role}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-muted-foreground">vCenter:</span>
                <Badge variant="outline">{vm.vcenter}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs 区域 */}
      <VmDetailTabs disks={disks} networks={networks} />
    </div>
  );
}
