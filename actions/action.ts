"use server";

import { serverApi } from "@/lib/fetch/server";
import type {
  ActionLogListResponse,
  CreateActionLogResponse,
} from "@/types/action";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

export interface GetActionLogsParams {
  page: number;
  page_size: number;
  service?: string;
  status?: string;
  target?: string;
}

/* 获取操作日志列表 */
export async function getActionLogsAction(
  params: GetActionLogsParams
): Promise<ActionLogListResponse> {
  const queryParams: Record<string, unknown> = {
    page: params.page,
    page_size: params.page_size,
  };

  // 只在有值的时候添加过滤参数
  if (params.service) {
    queryParams.service = params.service;
  }
  if (params.status && params.status !== "all") {
    queryParams.status = params.status;
  }
  if (params.target) {
    queryParams.target = params.target;
  }

  return serverApi.get<ActionLogListResponse>(
    `${API_BASE_URL}/actions`,
    queryParams
  );
}

interface CreateActionLogRequest {
  service: string;
  action: string;
  target: string;
  target_id: string;
  data: Record<string, unknown>;
}

export async function createActionLogAction(
  data: CreateActionLogRequest
): Promise<CreateActionLogResponse> {
  console.log("createActionLogAction", data);
  return serverApi.post<CreateActionLogResponse>(
    `${API_BASE_URL}/actions`,
    data as unknown as Record<string, unknown>
  );
}

export async function getActionLogAction(
  id: string
): Promise<CreateActionLogResponse> {
  return serverApi.get<CreateActionLogResponse>(
    `${API_BASE_URL}/actions/${id}`
  );
}

interface UpdateActionLogRequest {
  status: string;
  data: Record<string, unknown>;
}

export async function updateActionLogAction(
  id: string,
  data: UpdateActionLogRequest
): Promise<CreateActionLogResponse> {
  return serverApi.put<CreateActionLogResponse>(
    `${API_BASE_URL}/actions/${id}`,
    data as unknown as Record<string, unknown>
  );
}
