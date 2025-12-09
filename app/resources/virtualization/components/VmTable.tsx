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
import { StatusBadge } from "./StatusBadge";
import { PowerStatusBadge } from "./PowerStatusBadge";
import { VmContextMenu } from "./VmContextMenu";
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
            <TableHead>CPU</TableHead>
            <TableHead>内存</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>电源状态</TableHead>
            <TableHead>所有者</TableHead>
            <TableHead>应用</TableHead>
            <TableHead>环境</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>vCenter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={12} className="text-center text-muted-foreground">
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
          <TableHead>CPU</TableHead>
          <TableHead>内存</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>电源状态</TableHead>
          <TableHead>所有者</TableHead>
          <TableHead>应用</TableHead>
          <TableHead>环境</TableHead>
          <TableHead>角色</TableHead>
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
            <TableCell>{vm.address}</TableCell>
            <TableCell>{vm.cpu}</TableCell>
            <TableCell>{vm.memory} GB</TableCell>
            <TableCell>
              <StatusBadge status={vm.status} />
            </TableCell>
            <TableCell>
              <PowerStatusBadge powerStatus={vm.power_status} />
            </TableCell>
            <TableCell>{vm.owner}</TableCell>
            <TableCell>{vm.application}</TableCell>
            <TableCell>{vm.env}</TableCell>
            <TableCell>{vm.role}</TableCell>
            <TableCell>{vm.vcenter}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
