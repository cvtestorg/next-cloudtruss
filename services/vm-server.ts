import { serverApi } from "@/lib/fetch/server";
import type { VirtualMachineList, VirtualMachineDetail } from "@/types/vm";

const API_BASE_URL = "https://virtualization-api.gz.cvte.cn";

/**
 * 服务器端获取虚拟机列表
 * 用于 Server Components 和 Server Actions
 */
export async function getVirtualMachinesServer(
  page = 1,
  size = 50
): Promise<VirtualMachineList> {
  return serverApi.get<VirtualMachineList>(`${API_BASE_URL}/vm`, { page, size });
}

/**
 * 服务器端获取虚拟机详情
 * 用于 Server Components 和 Server Actions
 */
export async function getVirtualMachineDetailServer(
  vmId: string
): Promise<VirtualMachineDetail> {
  return serverApi.get<VirtualMachineDetail>(`${API_BASE_URL}/vm/${vmId}`);
}

