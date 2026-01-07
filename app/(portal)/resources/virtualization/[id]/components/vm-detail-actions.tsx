"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RotateCw, PowerOff, Power, Shield } from "lucide-react";
import { VmActionsMenu } from "./vm-actions-menu";
import { PermRequest } from "./perm-request";
import type { VirtualMachineItem } from "@/types/vm";
import { createActionLogAction } from "@/actions/action";
import { createTicketAction } from "@/actions/ticket";
import { TICKET_TYPE_VIRTUALIZATION } from "@/types/ticket";
import { toast } from "sonner";
import { getVmData } from "@/lib/vm/get-vm-data";

interface VmDetailActionsProps {
  vm: VirtualMachineItem;
  userAllowed: Record<string, boolean>;
}

export function VmDetailActions({ vm, userAllowed }: VmDetailActionsProps) {
  const [isPermRequestOpen, setIsPermRequestOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [shutdownDialogOpen, setShutdownDialogOpen] = useState(false);
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

    // 重启和关机操作需要确认对话框
    if (action === "restart") {
      setRestartDialogOpen(true);
      return;
    }

    if (action === "shutdown") {
      setShutdownDialogOpen(true);
      return;
    }

    // 防止重复操作
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // CPU/内存扩容需要创建审批单，而不是操作日志
      if (action === "cpu-memory-expand") {
        const title = `CPU/内存扩容 - ${vm.name}`;
        await createTicketAction({
          type_id: TICKET_TYPE_VIRTUALIZATION,
          title,
          data: vm as unknown as Record<string, unknown>,
        });
        toast.success("操作成功，不要重复操作");
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
        data: getVmData(vm),
      });
      toast.success("操作成功，不要重复操作");
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志/审批单失败:", error);
      toast.error("操作失败，请稍后重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestartConfirm = async () => {
    setRestartDialogOpen(false);
    
    // 防止重复操作
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await createActionLogAction({
        service: "virtualization",
        action: "restart",
        target: vm.name,
        target_id: vm.id,
        data: getVmData(vm),
      });
      toast.success("操作成功，不要重复操作");
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志失败:", error);
      toast.error("操作失败，请稍后重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShutdownConfirm = async () => {
    setShutdownDialogOpen(false);
    
    // 防止重复操作
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await createActionLogAction({
        service: "virtualization",
        action: "shutdown",
        target: vm.name,
        target_id: vm.id,
        data: getVmData(vm),
      });
      toast.success("操作成功，不要重复操作");
      // 创建成功后跳转到 action 列表
      router.push("/actions");
    } catch (error) {
      console.error("创建操作日志失败:", error);
      toast.error("操作失败，请稍后重试");
    } finally {
      setIsProcessing(false);
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
              <Button 
                variant="destructive" 
                onClick={() => setRestartDialogOpen(true)}
                disabled={isProcessing}
              >
                <RotateCw className="h-3 w-3" />
                重启
              </Button>
            )}
            {userAllowed["can_shutdown"] && (
              <Button 
                variant="destructive" 
                onClick={() => setShutdownDialogOpen(true)}
                disabled={isProcessing}
              >
                <PowerOff className="h-3 w-3" />
                关机
              </Button>
            )}
          </>
        )}
        <VmActionsMenu
          vm={vm}
          userAllowed={userAllowed}
          onAction={handleVmAction}
          disabled={isProcessing}
        >
          <Button variant="secondary" disabled={isProcessing}>
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

      <AlertDialog open={restartDialogOpen} onOpenChange={setRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重启</AlertDialogTitle>
            <AlertDialogDescription>
              确定要重启虚拟机 <strong>{vm.name}</strong> 吗? 此操作将导致虚拟机重启, 请确保已保存重要数据.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? "处理中..." : "确认重启"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={shutdownDialogOpen} onOpenChange={setShutdownDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认关机</AlertDialogTitle>
            <AlertDialogDescription>
              确定要关闭虚拟机 <strong>{vm.name}</strong> 吗? 此操作将导致虚拟机关机, 请确保已保存重要数据.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleShutdownConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? "处理中..." : "确认关机"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
