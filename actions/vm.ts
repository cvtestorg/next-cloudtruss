"use server";

import {
  getVirtualMachinesServer,
  getVirtualMachineDetailServer,
} from "@/services/vm-server";
import type {
  VirtualMachineList,
  VirtualMachineDetail,
} from "@/types/vm";

/**
 * Server Action: 获取虚拟机列表
 * 使用服务器端 API 调用，自动传递 access_token
 */
export async function getVirtualMachinesAction(
  page = 1,
  size = 50
): Promise<VirtualMachineList> {
  return await getVirtualMachinesServer(page, size);
}

/**
 * Server Action: 获取虚拟机详情
 * 使用服务器端 API 调用，自动传递 access_token
 */
export async function getVirtualMachineDetailAction(
  vmId: string
): Promise<VirtualMachineDetail> {
  return await getVirtualMachineDetailServer(vmId);
}

