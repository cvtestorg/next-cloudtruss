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
  userAllowed: Record<string, boolean>;
  onAction?: (action: string, vm: VirtualMachineItem) => void;
  disabled?: boolean;
}

export function VmActionsMenu({ vm, children, userAllowed, onAction, disabled }: VmActionsMenuProps) {
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
        {userAllowed["can_add_disk"] && (
          <DropdownMenuItem onClick={() => handleAction("disk-add")} disabled={disabled}>
            <HardDrive />
            磁盘新增
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => handleAction("view")}>
          <Eye />
          查看
        </DropdownMenuItem>

        {userAllowed["can_set_role"] && (
          <DropdownMenuItem onClick={() => handleAction("role-settings")} disabled={disabled}>
            <UserCog />
            角色设置
          </DropdownMenuItem>
        )}

        {userAllowed["can_sync"] && (
          <DropdownMenuItem onClick={() => handleAction("manual-sync")} disabled={disabled}>
            <RefreshCw />
            手动同步
          </DropdownMenuItem>
        )}

        {userAllowed["can_renew"] && (
          <DropdownMenuItem onClick={() => handleAction("renew")} disabled={disabled}>
            <Calendar />
            续期
          </DropdownMenuItem>
        )}

        {userAllowed["can_expand"] && (
          <DropdownMenuItem onClick={() => handleAction("cpu-memory-expand")} disabled={disabled}>
            <Cpu />
            CPU/内存扩容
          </DropdownMenuItem>
        )}

        {(userAllowed["can_add_disk"] ||
          userAllowed["can_set_role"] ||
          userAllowed["can_sync"] ||
          userAllowed["can_renew"] ||
          userAllowed["can_expand"] ||
          isPoweredOff ||
          isPoweredOn) && <DropdownMenuSeparator />}

        {isPoweredOff && userAllowed["can_start"] && (
          <DropdownMenuItem onClick={() => handleAction("power-on")} disabled={disabled}>
            <Power />
            开机
          </DropdownMenuItem>
        )}

        {isPoweredOn && (
          <>
            {userAllowed["can_restart"] && (
              <DropdownMenuItem
                onClick={() => handleAction("restart")}
                className="text-destructive focus:text-destructive"
                disabled={disabled}
              >
                <RotateCw />
                重启
              </DropdownMenuItem>
            )}
            {userAllowed["can_shutdown"] && (
              <DropdownMenuItem
                onClick={() => handleAction("shutdown")}
                className="text-destructive focus:text-destructive"
                disabled={disabled}
              >
                <PowerOff />
                关机
              </DropdownMenuItem>
            )}
          </>
        )}

        {(userAllowed["can_transfer"] ||
          userAllowed["can_suspend"] ||
          userAllowed["can_request_approval"] ||
          userAllowed["can_bind_project"]) && <DropdownMenuSeparator />}

        {userAllowed["can_transfer"] && (
          <DropdownMenuItem onClick={() => handleAction("transfer")} disabled={disabled}>
            <Users />
            过户
          </DropdownMenuItem>
        )}

        {userAllowed["can_suspend"] && (
          <DropdownMenuItem onClick={() => handleAction("suspend")} disabled={disabled}>
            <Pause />
            挂起
          </DropdownMenuItem>
        )}

        {userAllowed["can_request_approval"] && (
          <DropdownMenuItem onClick={() => handleAction("apply-change")} disabled={disabled}>
            <Edit />
            申请变更
          </DropdownMenuItem>
        )}

        {userAllowed["can_bind_project"] && (
          <DropdownMenuItem onClick={() => handleAction("bind-product")} disabled={disabled}>
            <Link />
            绑定产品
          </DropdownMenuItem>
        )}

        {(userAllowed["can_recycle"] || userAllowed["can_archive"]) && (
          <DropdownMenuSeparator />
        )}

        {userAllowed["can_recycle"] && (
          <DropdownMenuItem
            onClick={() => handleAction("resource-recycle")}
            className="text-destructive focus:text-destructive"
            disabled={disabled}
          >
            <Trash2 />
            资源回收
          </DropdownMenuItem>
        )}

        {userAllowed["can_archive"] && (
          <DropdownMenuItem onClick={() => handleAction("resource-archive")} disabled={disabled}>
            <Archive />
            资源归档
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

