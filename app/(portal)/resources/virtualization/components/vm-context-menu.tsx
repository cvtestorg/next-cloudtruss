import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  Play,
  Users,
  Pause,
  Edit,
  Link,
} from "lucide-react";
import type { VirtualMachineItem } from "@/types/vm";

interface VmContextMenuProps {
  vm: VirtualMachineItem;
  children: React.ReactNode;
  onAction?: (action: string, vm: VirtualMachineItem) => void;
}

export function VmContextMenu({ vm, children, onAction }: VmContextMenuProps) {
  const handleAction = (action: string) => {
    onAction?.(action, vm);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => handleAction("disk-add")}>
          <HardDrive />
          磁盘新增
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("view")}>
          <Eye />
          查看
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("role-settings")}>
          <UserCog />
          角色设置
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("manual-sync")}>
          <RefreshCw />
          手动同步
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("renew")}>
          <Calendar />
          续期
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("cpu-memory-expand")}>
          <Cpu />
          CPU/内存扩容
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleAction("force-restart")}>
          <RotateCw />
          强制重启
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Power />
            关机/电源
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleAction("shutdown")}>
              <PowerOff />
              关机
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction("power-on")}>
              <Play />
              开机
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleAction("transfer")}>
          <Users />
          过户
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("suspend")}>
          <Pause />
          挂起
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("apply-change")}>
          <Edit />
          申请变更
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("bind-product")}>
          <Link />
          绑定产品
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => handleAction("resource-recycle")}
          variant="destructive"
        >
          <Trash2 />
          资源回收
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction("resource-archive")}>
          <Archive />
          资源归档
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

