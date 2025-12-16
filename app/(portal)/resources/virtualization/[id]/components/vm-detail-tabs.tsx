"use client";

import { useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HardDrive,
  Camera,
  Network,
  Activity,
  LineChart,
  FileText,
  BookOpen,
} from "lucide-react";
import { DiskTable } from "./disk-table";
import { NetworkTable } from "./network-table";
import type { VirtualDisk, VirtualNetwork } from "@/types/vm";

interface VmDetailTabsProps {
  disks: VirtualDisk[];
  networks: VirtualNetwork[];
}

export function VmDetailTabs({ disks, networks }: VmDetailTabsProps) {
  // 检查数据是否存在
  const hasDisks = disks && disks.length > 0;
  const hasNetworks = networks && networks.length > 0;
  // 快照数据暂时不存在, 如果有快照数据可以在这里添加检查逻辑
  const hasSnapshots = false;

  // 确定默认选中的 Tab
  const defaultValue = useMemo(() => {
    if (hasDisks) return "disk";
    if (hasSnapshots) return "snapshot";
    if (hasNetworks) return "network";
    return "monitor";
  }, [hasDisks, hasSnapshots, hasNetworks]);

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="w-full">
        {hasDisks && (
          <TabsTrigger
            value="disk"
            className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            <HardDrive className="h-4 w-4" />
            硬盘
          </TabsTrigger>
        )}
        {hasSnapshots && (
          <TabsTrigger
            value="snapshot"
            className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            <Camera className="h-4 w-4" />
            快照
          </TabsTrigger>
        )}
        {hasNetworks && (
          <TabsTrigger
            value="network"
            className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            <Network className="h-4 w-4" />
            网卡
          </TabsTrigger>
        )}
        <TabsTrigger
          value="monitor"
          className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <Activity className="h-4 w-4" />
          监控信息
        </TabsTrigger>
        <TabsTrigger
          value="monitor-agentless"
          className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <LineChart className="h-4 w-4" />
          监控信息(Agentless)
        </TabsTrigger>
        <TabsTrigger
          value="logs"
          className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <FileText className="h-4 w-4" />
          操作记录
        </TabsTrigger>
        <TabsTrigger
          value="help"
          className="px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <BookOpen className="h-4 w-4" />
          帮助文档
        </TabsTrigger>
      </TabsList>

      {hasDisks && (
        <TabsContent value="disk" className="space-y-4">
          <DiskTable disks={disks} />
        </TabsContent>
      )}

      {hasSnapshots && (
        <TabsContent value="snapshot">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            快照功能开发中...
          </div>
        </TabsContent>
      )}

      {hasNetworks && (
        <TabsContent value="network" className="space-y-4">
          <NetworkTable networks={networks} />
        </TabsContent>
      )}

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
  );
}
