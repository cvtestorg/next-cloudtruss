import { serverApi } from "@/lib/fetch-server";
import type {
  ApprovalResponse,
  CreateTicketRequest,
  CreateTicketResponse,
  GetTicketsParams,
  TicketDetailResponse,
  TicketListResponse,
} from "@/types/ticket";
import { TICKET_TYPE } from "@/types/ticket";

const API_BASE_URL = "https://mini-approval.gz.cvte.cn";

/**
 * 服务器端获取工单列表
 * 用于 Server Components 和 Server Actions
 */
export async function getTicketsServer(
  params: GetTicketsParams
): Promise<TicketListResponse> {
  return serverApi.get<TicketListResponse>(
    `${API_BASE_URL}/tickets`,
    params as Record<string, unknown>
  );
}

/**
 * 服务器端获取工单详情
 * 用于 Server Components 和 Server Actions
 */
export async function getTicketDetailServer(
  id: string
): Promise<TicketDetailResponse> {
  return serverApi.get<TicketDetailResponse>(`${API_BASE_URL}/tickets/${id}`);
}

/**
 * 服务器端创建工单
 * 用于 Server Actions
 */
export async function createTicketServer(
  data: CreateTicketRequest
): Promise<CreateTicketResponse> {
  return serverApi.post<CreateTicketResponse>(`${API_BASE_URL}/tickets`, {
    ...data,
    type_id: data.type_id ?? TICKET_TYPE,
  });
}

/**
 * 服务器端更新工单
 * 用于 Server Actions
 */
export async function updateTicketServer(
  id: string,
  data: { data: Record<string, unknown>; status: string; reason?: string }
): Promise<TicketDetailResponse> {
  return serverApi.put<TicketDetailResponse>(`${API_BASE_URL}/tickets/${id}`, data);
}

/**
 * 服务器端删除工单
 * 用于 Server Actions
 */
export async function deleteTicketServer(id: string): Promise<{ message?: string }> {
  return serverApi.delete<{ message?: string }>(`${API_BASE_URL}/tickets/${id}`);
}

/**
 * 服务器端获取审批详情
 * 用于 Server Components 和 Server Actions
 */
export async function getApprovalServer(
  approvalId: string
): Promise<ApprovalResponse> {
  return serverApi.get<ApprovalResponse>(`${API_BASE_URL}/jdy/approval`, {
    approval_id: approvalId,
  });
}

