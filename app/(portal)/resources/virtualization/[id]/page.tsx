import { notFound } from "next/navigation";
import { getVirtualMachineDetailAction } from "@/actions/vm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  ArrowLeft,
  Power,
  PowerOff,
  Server,
  Settings,
  HardDrive,
  Cpu,
  Network,
  User,
  Activity,
  Package,
  Box,
  Users,
  Shield,
  Globe,
  UserCog,
  Database
} from "lucide-react";
import { StatusBadge } from "../components/status-badge";
import { VmDetailActions } from "./components/vm-detail-actions";
import { VmDetailTabs } from "./components/vm-detail-tabs";
import Link from "next/link";
import { fgaClient } from "@/lib/openfga";
import { getCurrentUserAction } from "@/actions/user";
import { VIRTUAL_MACHINE_PERMISSIONS } from "@/config/permissions";
import { UnauthorizedError } from "@/lib/errors";
import { handleUnauthorizedAction } from "@/actions/auth";
import { headers } from "next/headers";

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
  let data;
  try {
    data = await getVirtualMachineDetailAction(id);
  } catch (error) {
    // 如果遇到 401 错误（AccessToken 过期），清除 session 并重定向到登录页
    if (error instanceof UnauthorizedError) {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || headersList.get("referer") || "/";
      await handleUnauthorizedAction(pathname);
    }
    // 其他错误重新抛出
    throw error;
  }

  /* 如果数据不存在，则返回 404 */
  if (!data?.data) {
    notFound();
  }

  /* 获取当前登录的用户信息 */
  let currentUser;
  try {
    currentUser = await getCurrentUserAction();
  } catch (error) {
    // 如果遇到 401 错误（AccessToken 过期），清除 session 并重定向到登录页
    if (error instanceof UnauthorizedError) {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || headersList.get("referer") || "/";
      await handleUnauthorizedAction(pathname);
    }
    // 其他错误重新抛出
    throw error;
  }
  // console.log(currentUser.data?.id);

  /* 获取权限数据 */
  // 只在运行时且环境变量配置完整时检查权限
  let userAllowed: Record<string, boolean> = {};
  
  if (
    process.env.FGA_API_URL &&
    currentUser.data?.id
  ) {
    try {
      const check_permissions = VIRTUAL_MACHINE_PERMISSIONS.map((permission: string) => ({
        user: `user:${currentUser.data?.id}`,
        relation: permission,
        object: `virtual_machine:${id}`,
      }));
      const { result } = await fgaClient.batchCheck({ checks: check_permissions });
      // 解析权限结果为字典
      // 优化：使用 Object.fromEntries 使代码更简洁高效
      userAllowed = Object.fromEntries(
        result.map(item => [item.request.relation, item.allowed])
      );
    } catch (error) {
      // 如果 OpenFGA 不可用，默认拒绝所有权限
      console.error("Failed to check permissions with OpenFGA:", error);
      userAllowed = Object.fromEntries(
        VIRTUAL_MACHINE_PERMISSIONS.map((permission: string) => [permission, false])
      );
    }
  } else {
    // 如果 OpenFGA 未配置，默认拒绝所有权限
    userAllowed = Object.fromEntries(
      VIRTUAL_MACHINE_PERMISSIONS.map((permission: string) => [permission, false])
    );
  }
  // console.log(userAllowed);

  const vm = data.data;
  const disks = vm.disk || [];
  const networks = vm.network || [];

  return (
    <div className="space-y-6">
      {/* 顶部标题和操作栏 */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Link href="/resources/virtualization" className="pt-3">
            <Button variant="ghost" className="h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Monitor className="h-14 w-14 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{vm.name}</h1>
              {(() => {
                const normalizedStatus = vm.power_status?.toLowerCase() || "";
                const isOn = normalizedStatus === "on" || normalizedStatus === "poweredon";
                const isOff = normalizedStatus === "off" || normalizedStatus === "poweredoff";
                return (
                  <Badge variant={isOn ? "default" : isOff ? "secondary" : "outline"}>
                    {isOn && <Power className="h-3 w-3 mr-1" />}
                    {isOff && <PowerOff className="h-3 w-3 mr-1" />}
                    {isOn ? "已开机" : isOff ? "已关机" : vm.power_status}
                  </Badge>
                );
              })()}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 资源信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              资源信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">主机:</span>
                <span className="font-medium">{vm.hostname}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">内存:</span>
                <span className="font-medium">{vm.memory} GB</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">CPU:</span>
                <span className="font-medium">{vm.cpu} C</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">IP 地址:</span>
                <span className="font-medium">{vm.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">所有者:</span>
                <span className="font-medium">{vm.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">状态:</span>
                <StatusBadge status={vm.status} />
              </div>
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">角色:</span>
                <span className="font-medium">{vm.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 服务信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              服务信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">产品线:</span>
                <span className="font-medium">{vm.application}</span>
              </div>
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">产品:</span>
                <Badge variant="default" className="w-fit">{vm.application}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">集群:</span>
                <Badge variant="default" className="w-fit">{vm.vcluster}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">虚拟机类型:</span>
                <span className="font-medium">
                  {vm.is_flash ? "闪电VM" : "混合VM"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">堡垒机:</span>
                <span className="font-medium">{vm.iam ? "已注册" : "未注册"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">环境:</span>
                <span className="font-medium">{vm.env}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">vCenter:</span>
                <Badge variant="outline" className="w-fit">{vm.vcenter}</Badge>
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
