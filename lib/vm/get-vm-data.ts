import type { VirtualMachineItem } from "@/types/vm";

/**
 * 从虚拟机对象中提取主机数据，排除 disk 和 network 字段
 * @param vm 虚拟机对象，可能包含 disk 和 network 字段
 * @returns 只包含主机字段的数据对象
 */
export function getVmData(
  vm:
    | VirtualMachineItem
    | (VirtualMachineItem & { disk?: unknown; network?: unknown })
): Record<string, unknown> {
  const {
    id,
    uuid,
    name,
    hostname,
    address,
    cpu,
    memory,
    status,
    power_status,
    product,
    product_line,
    owner,
    application,
    env,
    role,
    iam,
    description,
    is_archive,
    vcluster,
    is_flash,
    vcenter,
    resource_type,
    is_recycle,
    create_at,
    expire_date,
    sync_time,
  } = vm;

  return {
    id,
    uuid,
    name,
    hostname,
    address,
    cpu,
    memory,
    status,
    power_status,
    product,
    product_line,
    owner,
    application,
    env,
    role,
    iam,
    description,
    is_archive,
    vcluster,
    is_flash,
    vcenter,
    resource_type,
    is_recycle,
    create_at,
    expire_date,
    sync_time,
  };
}
