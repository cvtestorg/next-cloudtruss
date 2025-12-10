"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";
import { VmContextMenu } from "./VmContextMenu";
import { UserBadge } from "./UserBadge";
import { EnvBadge } from "./EnvBadge";
import type { VirtualMachineItem } from "@/types/vm";

interface VmTableProps {
  vms: VirtualMachineItem[];
  onVmAction?: (action: string, vm: VirtualMachineItem) => void;
}

export function VmTable({ vms, onVmAction }: VmTableProps) {
  const router = useRouter();

  if (vms.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>主机名</TableHead>
            <TableHead>地址</TableHead>
            <TableHead>CPU/内存</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>所有者</TableHead>
            <TableHead>应用</TableHead>
            <TableHead>环境</TableHead>
            <TableHead>vCenter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
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
          <TableHead>名称</TableHead>
          <TableHead>主机名</TableHead>
          <TableHead>地址</TableHead>
          <TableHead>CPU/内存</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>所有者</TableHead>
          <TableHead>应用</TableHead>
          <TableHead>环境</TableHead>
          <TableHead>vCenter</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vms.map((vm) => (
          <TableRow key={vm.id}>
            <TableCell>
              <VmContextMenu vm={vm} onAction={onVmAction}>
                <div
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    router.push(`/resources/virtualization/${vm.id}`)
                  }
                >
                  {vm.name}
                </div>
              </VmContextMenu>
            </TableCell>
            <TableCell>{vm.hostname}</TableCell>
            <TableCell>
              {vm.address ? (
                <div className="flex items-center gap-1">
                  <span className="font-mono text-sm">{vm.address}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(vm.address);
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
                </div>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{`${vm.cpu} C / ${vm.memory} GB`}</TableCell>
            <TableCell>
              <StatusBadge status={vm.status} />
            </TableCell>
            <TableCell>
              <UserBadge userId={vm.owner} />
            </TableCell>
            <TableCell>{vm.application}</TableCell>
            <TableCell>
              <EnvBadge env={vm.env} />
            </TableCell>
            <TableCell>{vm.vcenter}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
