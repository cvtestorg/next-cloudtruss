"use server";

import { serverApi } from "@/lib/fetch/server";
import type { VirtualMachineList, VirtualMachineDetail } from "@/types/vm";

const API_BASE_URL = "https://virtualization-api.gz.cvte.cn";

export interface VirtualMachineFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  powerStatus?: string;
  env?: string;
}

/* 获取虚拟机列表 */
export async function getVirtualMachinesAction(
  filters: VirtualMachineFilters = {}
): Promise<VirtualMachineList> {
  const { page = 1, size = 20, search, status, powerStatus, env } = filters;

  const params: Record<string, unknown> = {
    page,
    size,
  };

  // 只在有值的时候添加过滤参数
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (powerStatus && powerStatus !== "all") params.power_status = powerStatus;
  if (env && env !== "all") params.env = env;

  return serverApi.get<VirtualMachineList>(`${API_BASE_URL}/vm`, params);
}

/* 获取虚拟机详情 */
export async function getVirtualMachineDetailAction(
  vmId: string
): Promise<VirtualMachineDetail> {
  return serverApi.get<VirtualMachineDetail>(`${API_BASE_URL}/vm/${vmId}`);
}
