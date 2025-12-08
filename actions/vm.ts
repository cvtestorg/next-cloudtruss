"use server";

import { serverApi } from "@/lib/fetch/server";
import type { VirtualMachineList, VirtualMachineDetail } from "@/types/vm";

const API_BASE_URL = "https://virtualization-api.gz.cvte.cn";

export async function getVirtualMachinesAction(
  page = 1,
  size = 50
): Promise<VirtualMachineList> {
  return serverApi.get<VirtualMachineList>(`${API_BASE_URL}/vm`, {
    page,
    size,
  });
}

export async function getVirtualMachineDetailAction(
  vmId: string
): Promise<VirtualMachineDetail> {
  return serverApi.get<VirtualMachineDetail>(`${API_BASE_URL}/vm/${vmId}`);
}
