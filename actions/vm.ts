"use server";

import { serverApi } from "@/lib/fetch/server";
import type {
  VirtualMachineList,
  VirtualMachineDetail,
  VirtualMachineStatusResponse,
  VcenterReponse,
  VDataCenterResponse,
  VClusterResponse,
  OSResponse,
  VResourcePoolResponse,
  VTemplateResponse,
  VSwitchResponse,
  VStorageResponse,
  VStorageProfileResponse,
} from "@/types/vm";

const API_BASE_URL = "https://virtualization-api.gz.cvte.cn";
const API_TOKEN = "38d629fc7eff4dac82f601dccf0270d5";

/**
 * 通用 API 请求辅助函数
 */
async function fetchWithToken<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  let apiUrl = `${API_BASE_URL}${endpoint}`;

  // 构建查询参数
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });
    if (searchParams.toString()) {
      apiUrl += `?${searchParams.toString()}`;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-access-token": API_TOKEN,
  };

  const response = await fetch(apiUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface VirtualMachineFilters {
  page?: number;
  size?: number;
  like_name?: string;
  like_env?: string;
  vcenter?: string;
  status?: string;
}

/* 获取虚拟机列表 */
export async function getVirtualMachinesAction(
  filters: VirtualMachineFilters = {},
): Promise<VirtualMachineList> {
  const { page = 1, size = 20, like_name, like_env, vcenter, status } = filters;

  const params: Record<string, unknown> = {
    page,
    size,
  };

  // 只在有值的时候添加过滤参数
  if (like_name) params.like_name = like_name;
  if (like_env && like_env !== "all") params.like_env = like_env;
  if (vcenter && vcenter !== "all") params.vcenter = vcenter;
  if (status && status !== "all") params.status = status;

  const apiUrl = `${API_BASE_URL}/vm`;
  // console.log("[getVirtualMachinesAction] API Request:");
  // console.log("  URL:", apiUrl);
  // console.log("  Params:", JSON.stringify(params, null, 2));

  return serverApi.get<VirtualMachineList>(apiUrl, params);
}

/* 获取虚拟机详情 */
export async function getVirtualMachineDetailAction(
  vmId: string,
): Promise<VirtualMachineDetail> {
  return serverApi.get<VirtualMachineDetail>(`${API_BASE_URL}/vm/${vmId}`);
}

/* 获取虚拟机状态枚举数据 */
export async function getVirtualMachineStatusAction(): Promise<VirtualMachineStatusResponse> {
  return serverApi.get<VirtualMachineStatusResponse>(
    `${API_BASE_URL}/resources/vm/status/list`,
  );
}

/* 获取 vcenter 列表 */
export async function getVcenterListAction(): Promise<VcenterReponse> {
  return fetchWithToken<VcenterReponse>("/vcenter");
}

/* 获取虚拟数据中心列表 */
export async function getVDataCenterListAction(
  vcenter?: string,
): Promise<VDataCenterResponse> {
  return fetchWithToken<VDataCenterResponse>("/vdatacenter", {
    ...(vcenter && { vcenter }),
  });
}

/* 获取操作系统列表 */
export async function getOSListAction(): Promise<OSResponse> {
  return fetchWithToken<OSResponse>("/resources/vtemplate/list");
}

/* 获取集群列表 */
export async function getVClusterListAction(
  vdatacenter?: string,
): Promise<VClusterResponse> {
  return fetchWithToken<VClusterResponse>("/vcluster", {
    ...(vdatacenter && { vdatacenter }),
  });
}

/* 获取虚拟机资源池列表 */
export async function getVResourcePoolListAction(
  vcluster?: string,
  vcenter?: string,
): Promise<VResourcePoolResponse> {
  return fetchWithToken<VResourcePoolResponse>("/vresourcepool", {
    ...(vcluster && { vcluster }),
    ...(vcenter && { vcenter }),
  });
}

/* 获取虚拟机模板列表 */
export async function getVTemplateListAction(
  vcenter?: string,
): Promise<VTemplateResponse> {
  return fetchWithToken<VTemplateResponse>("/vtemplate", {
    ...(vcenter && { vcenter }),
  });
}

/* 获取虚拟交换机列表 */
export async function getVSwitchListAction(
  vcluster?: string,
  vcenter?: string,
  vlan?: string,
): Promise<VSwitchResponse> {
  return fetchWithToken<VSwitchResponse>("/vswitch", {
    ...(vcluster && { vcluster }),
    ...(vcenter && { vcenter }),
    ...(vlan && { vlan }),
  });
}

/* 获取虚拟存储池列表 */
export async function getVStorageListAction(
  vcluster?: string,
  vcenter?: string,
): Promise<VStorageResponse> {
  return fetchWithToken<VStorageResponse>("/vstorage", {
    ...(vcluster && { vcluster }),
    ...(vcenter && { vcenter }),
  });
}

/* 获取虚拟存储池策略列表 */
export async function getVStorageProfileListAction(
  vcluster?: string,
  vcenter?: string,
): Promise<VStorageProfileResponse> {
  return fetchWithToken<VStorageProfileResponse>("/vstorageprofile", {
    ...(vcluster && { vcluster }),
    ...(vcenter && { vcenter }),
  });
}
