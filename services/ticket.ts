import { api } from "@/lib/fetch/client";
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

export async function getTickets(
  params: GetTicketsParams
): Promise<TicketListResponse> {
  return api.get<TicketListResponse>(
    `${API_BASE_URL}/tickets`,
    params as Record<string, unknown>
  );
}

export async function getTicketDetail(
  id: string
): Promise<TicketDetailResponse> {
  return api.get<TicketDetailResponse>(`${API_BASE_URL}/tickets/${id}`);
}

export async function createTicket(
  data: CreateTicketRequest
): Promise<CreateTicketResponse> {
  return api.post<CreateTicketResponse>(`${API_BASE_URL}/tickets`, {
    ...data,
    type_id: data.type_id ?? TICKET_TYPE,
  });
}

export async function updateTicket(
  id: string,
  data: { data: Record<string, unknown>; status: string; reason?: string }
): Promise<TicketDetailResponse> {
  return api.put<TicketDetailResponse>(`${API_BASE_URL}/tickets/${id}`, data);
}

export async function deleteTicket(id: string): Promise<{ message?: string }> {
  return api.delete<{ message?: string }>(`${API_BASE_URL}/tickets/${id}`);
}

export async function getApproval(
  approvalId: string
): Promise<ApprovalResponse> {
  return api.get<ApprovalResponse>(`${API_BASE_URL}/jdy/approval`, {
    approval_id: approvalId,
  });
}
