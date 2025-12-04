import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HardDrive,
  Eye,
  UserCog,
  RefreshCw,
  Calendar,
  Cpu,
  Trash2,
  Archive,
  RotateCw,
  Power,
  PowerOff,
  Users,
  Pause,
  Edit,
  Link,
} from "lucide-react";
import type { VirtualMachineItem } from "@/types/vm";

interface VmActionsMenuProps {
  vm: VirtualMachineItem;
  children: React.ReactNode;
  onAction?: (action: string, vm: VirtualMachineItem) => void;
}

export function VmActionsMenu({ vm, children, onAction }: VmActionsMenuProps) {
  const handleAction = (action: string) => {
    onAction?.(action, vm);
  };

  // 判断电源状态
  const normalizedPowerStatus = vm.power_status?.toLowerCase() || "";
  const isPoweredOn =
    normalizedPowerStatus === "on" || normalizedPowerStatus === "poweredon";
  const isPoweredOff =
    normalizedPowerStatus === "off" ||
    normalizedPowerStatus === "poweredoff";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem onClick={() => handleAction("disk-add")}>
          <HardDrive />
          磁盘新增
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("view")}>
          <Eye />
          查看
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("role-settings")}>
          <UserCog />
          角色设置
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("manual-sync")}>
          <RefreshCw />
          手动同步
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("renew")}>
          <Calendar />
          续期
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("cpu-memory-expand")}>
          <Cpu />
          CPU/内存扩容
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isPoweredOff && (
          <DropdownMenuItem onClick={() => handleAction("power-on")}>
            <Power />
            开机
          </DropdownMenuItem>
        )}

        {isPoweredOn && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction("restart")}
              className="text-destructive focus:text-destructive"
            >
              <RotateCw />
              重启
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("shutdown")}
              className="text-destructive focus:text-destructive"
            >
              <PowerOff />
              关机
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleAction("transfer")}>
          <Users />
          过户
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("suspend")}>
          <Pause />
          挂起
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("apply-change")}>
          <Edit />
          申请变更
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("bind-product")}>
          <Link />
          绑定产品
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleAction("resource-recycle")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 />
          资源回收
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("resource-archive")}>
          <Archive />
          资源归档
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

