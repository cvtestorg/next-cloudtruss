"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, PowerCircle, Power, Shield } from "lucide-react";
import { VmActionsMenu } from "./VmActionsMenu";
import { PermRequest } from "./PermRequest";
import type { VirtualMachineItem } from "@/types/vm";

interface VmDetailActionsProps {
  vm: VirtualMachineItem;
  userAllowed: Record<string, boolean>;
}

export function VmDetailActions({ vm, userAllowed }: VmDetailActionsProps) {
  const [isPermRequestOpen, setIsPermRequestOpen] = useState(false);

  // 判断电源状态
  const normalizedPowerStatus = vm.power_status?.toLowerCase() || "";
  const isPoweredOn =
    normalizedPowerStatus === "on" || normalizedPowerStatus === "poweredon";
  const isPoweredOff =
    normalizedPowerStatus === "off" ||
    normalizedPowerStatus === "poweredoff";

  const handleVmAction = (action: string, vm: VirtualMachineItem) => {
    console.log(`执行操作: ${action}`, vm);
    // TODO: 根据不同的 action 执行对应的操作
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
              <Button variant="destructive">
                <RotateCw className="h-3 w-3" />
                重启
              </Button>
            )}
            {userAllowed["can_shutdown"] && (
              <Button variant="destructive">
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
        userAllowed={userAllowed}
        open={isPermRequestOpen}
        onOpenChange={setIsPermRequestOpen}
      />
    </>
  );
}
