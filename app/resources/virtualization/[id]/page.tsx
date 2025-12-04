"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVirtualMachineDetailAction } from "@/actions/vm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StatusBadge } from "../components/StatusBadge";
import { PowerStatusBadge } from "../components/PowerStatusBadge";
import { VmActionsMenu } from "./components/VmActionsMenu";
import { DiskTable } from "./components/DiskTable";
import { NetworkTable } from "./components/NetworkTable";
import type { VirtualMachineDetail } from "@/types/vm";
import {
  RotateCw,
  PowerOff,
  Power,
  MoreHorizontal,
  HardDrive,
  Camera,
  Network,
  Activity,
  LineChart,
  FileText,
  BookOpen,
  ArrowLeft,
  Monitor,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VirtualMachineDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [data, setData] = useState<VirtualMachineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setError(new Error("缺少虚拟机 ID"));
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 使用 Server Action 调用服务器端 API
        const result = await getVirtualMachineDetailAction(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("未知错误"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          加载失败: {error instanceof Error ? error.message : "未知错误"}
        </div>
      </div>
    );
  }

  const vm = data.data;
  const disks = vm.disk || [];
  const networks = vm.network || [];

  // 判断电源状态
  const normalizedPowerStatus = vm.power_status?.toLowerCase() || "";
  const isPoweredOn =
    normalizedPowerStatus === "on" || normalizedPowerStatus === "poweredon";
  const isPoweredOff =
    normalizedPowerStatus === "off" ||
    normalizedPowerStatus === "poweredoff";

  // 处理操作菜单
  const handleVmAction = (action: string) => {
    console.log(`执行操作: ${action}`, vm);
    // TODO: 根据不同的 action 执行对应的操作
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题和操作栏 */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/resources/virtualization")}
            className="h-8 w-8 mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
        <div className="flex items-center gap-3">
          {isPoweredOff && (
            <Button variant="outline" size="sm">
              <Power className="h-4 w-4" />
              开机
            </Button>
          )}
          {isPoweredOn && (
            <>
              <Button variant="destructive" size="sm">
                <RotateCw className="h-4 w-4" />
                重启
              </Button>
              <Button variant="destructive" size="sm">
                <PowerOff className="h-4 w-4" />
                关机
              </Button>
            </>
          )}
          <VmActionsMenu vm={vm} onAction={handleVmAction}>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              更多操作
            </Button>
          </VmActionsMenu>
        </div>
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
      <Tabs defaultValue="disk" className="w-full">
        <TabsList>
          <TabsTrigger value="disk" className="px-10">
            <HardDrive className="h-4 w-4" />
            硬盘
          </TabsTrigger>
          <TabsTrigger value="snapshot" className="px-10">
            <Camera className="h-4 w-4" />
            快照
          </TabsTrigger>
          <TabsTrigger value="network" className="px-10">
            <Network className="h-4 w-4" />
            网卡
          </TabsTrigger>
          <TabsTrigger value="monitor" className="px-10">
            <Activity className="h-4 w-4" />
            监控信息
          </TabsTrigger>
          <TabsTrigger value="monitor-agentless" className="px-10">
            <LineChart className="h-4 w-4" />
            监控信息(Agentless)
          </TabsTrigger>
          <TabsTrigger value="logs" className="px-10">
            <FileText className="h-4 w-4" />
            操作记录
          </TabsTrigger>
          <TabsTrigger value="help" className="px-10">
            <BookOpen className="h-4 w-4" />
            帮助文档
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disk" className="space-y-4">
          <DiskTable disks={disks} />
        </TabsContent>

        <TabsContent value="snapshot">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            快照功能开发中...
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <NetworkTable networks={networks} />
        </TabsContent>

        <TabsContent value="monitor">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            监控信息开发中...
          </div>
        </TabsContent>

        <TabsContent value="monitor-agentless">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            监控信息(Agentless)开发中...
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            操作记录开发中...
          </div>
        </TabsContent>

        <TabsContent value="help">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            帮助文档开发中...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

