"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCw, PowerCircle, Power, Shield } from "lucide-react";
import { VmActionsMenu } from "./vm-actions-menu";
import { PermRequest } from "./perm-request";
import type { VirtualMachineItem } from "@/types/vm";
import { createActionLogAction } from "@/actions/action";
import { createTicketAction } from "@/actions/ticket";
import { TICKET_TYPE_VIRTUALIZATION } from "@/types/ticket";

interface VmDetailActionsProps {
  vm: VirtualMachineItem;
  userAllowed: Record<string, boolean>;
}

export function VmDetailActions({ vm, userAllowed }: VmDetailActionsProps) {
  const [isPermRequestOpen, setIsPermRequestOpen] = useState(false);
  const router = useRouter();

  // 判断电源状态
  const normalizedPowerStatus = vm.power_status?.toLowerCase() || "";
  const isPoweredOn =
    normalizedPowerStatus === "on" || normalizedPowerStatus === "poweredon";
  const isPoweredOff =
    normalizedPowerStatus === "off" ||
    normalizedPowerStatus === "poweredoff";

  const handleVmAction = async (action: string, vm: VirtualMachineItem) => {
    console.log(`执行操作: ${action}`, vm);
    
    // 对于"查看"操作，不需要创建操作日志
    if (action === "view") {
      return;
    }

    try {
      // CPU/内存扩容需要创建审批单，而不是操作日志
      if (action === "cpu-memory-expand") {
        const title = `CPU/内存扩容 - ${vm.name}`;
        await createTicketAction({
          type_id: TICKET_TYPE_VIRTUALIZATION,
          title,
          data: {
            vmId: vm.id,
            vmName: vm.name,
            vmHostname: vm.hostname,
            vmAddress: vm.address,
            action: "cpu-memory-expand",
          },
        });
        // 创建成功后跳转到审批单列表
        router.push("/ticket");
        return;
      }

      // 其他操作创建操作日志
      await createActionLogAction({
        service: "virtualization",
        action: action,
        target: vm.name,
        target_id: vm.id,
        data: {},
      });
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志/审批单失败:", error);
      // 可以在这里添加错误提示
    }
  };

  const handleRestart = async () => {
    try {
      await createActionLogAction({
        service: "virtualization",
        action: "restart",
        target: vm.name,
        target_id: vm.id,
        data: {},
      });
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志失败:", error);
      // 可以在这里添加错误提示
    }
  };

  const handleShutdown = async () => {
    try {
      await createActionLogAction({
        service: "virtualization",
        action: "shutdown",
        target: vm.name,
        target_id: vm.id,
        data: {},
      });
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志失败:", error);
      // 可以在这里添加错误提示
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPermRequestOpen(true)}
          title="权限申请"
        >
          <Shield className="h-4 w-4" />
        </Button>
        {isPoweredOff && userAllowed["can_start"] && (
          <Button variant="outline" size="sm">
            <Power className="h-4 w-4" />
            开机
          </Button>
        )}
        {isPoweredOn && (
          <>
            {userAllowed["can_restart"] && (
              <Button variant="destructive" onClick={handleRestart}>
                <RotateCw className="h-3 w-3" />
                重启
              </Button>
            )}
            {userAllowed["can_shutdown"] && (
              <Button variant="destructive" onClick={handleShutdown}>
                <PowerCircle className="h-3 w-3" />
                关机
              </Button>
            )}
          </>
        )}
        <VmActionsMenu
          vm={vm}
          userAllowed={userAllowed}
          onAction={handleVmAction}
        >
          <Button variant="secondary">
            更多操作
          </Button>
        </VmActionsMenu>
      </div>
      <PermRequest
        vmId={vm.id}
        vm={vm}
        userAllowed={userAllowed}
        open={isPermRequestOpen}
        onOpenChange={setIsPermRequestOpen}
      />
    </>
  );
}
