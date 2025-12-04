import { api } from "@/lib/fetch";
import type { VirtualMachineList, VirtualMachineDetail } from "@/types/vm";

const API_BASE_URL = "https://virtualization-api.gz.cvte.cn";

export async function getVirtualMachines(
  page = 1,
  size = 50
): Promise<VirtualMachineList> {
  return api.get<VirtualMachineList>(`${API_BASE_URL}/vm`, { page, size });
}

export async function getVirtualMachineDetail(
  vmId: string
): Promise<VirtualMachineDetail> {
  return api.get<VirtualMachineDetail>(`${API_BASE_URL}/vm/${vmId}`);
}
