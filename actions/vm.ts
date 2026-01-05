"use server";

import { serverApi } from "@/lib/fetch/server";
import type { VirtualMachineList, VirtualMachineDetail } from "@/types/vm";

const API_BASE_URL = "https://virtualization-api.gz.cvte.cn";

export interface VirtualMachineFilters {
  page?: number;
  size?: number;
  like_name?: string;
  like_env?: string;
  vcenter?: string;
}

/* 获取虚拟机列表 */
export async function getVirtualMachinesAction(
  filters: VirtualMachineFilters = {}
): Promise<VirtualMachineList> {
  const { page = 1, size = 20, like_name, like_env, vcenter } = filters;

  const params: Record<string, unknown> = {
    page,
    size,
  };

  // 只在有值的时候添加过滤参数
  if (like_name) params.like_name = like_name;
  if (like_env && like_env !== "all") params.like_env = like_env;
  if (vcenter && vcenter !== "all") params.vcenter = vcenter;

  const apiUrl = `${API_BASE_URL}/vm`;
  // console.log("[getVirtualMachinesAction] API Request:");
  // console.log("  URL:", apiUrl);
  // console.log("  Params:", JSON.stringify(params, null, 2));

  return serverApi.get<VirtualMachineList>(apiUrl, params);
}

/* 获取虚拟机详情 */
export async function getVirtualMachineDetailAction(
  vmId: string
): Promise<VirtualMachineDetail> {
  return serverApi.get<VirtualMachineDetail>(`${API_BASE_URL}/vm/${vmId}`);
}
