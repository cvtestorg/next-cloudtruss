"use server";

import { serverApi } from "@/lib/fetch/server";
import type {
  ApprovalResponse,
  CreateTicketRequest,
  CreateTicketResponse,
  GetTicketsParams,
  TicketDetailResponse,
  TicketListResponse,
} from "@/types/ticket";
import { TICKET_TYPE_VIRTUALIZATION } from "@/types/ticket";

const API_BASE_URL = "https://mini-approval.gz.cvte.cn";

export async function getTicketsAction(
  params: GetTicketsParams
): Promise<TicketListResponse> {
  return serverApi.get<TicketListResponse>(
    `${API_BASE_URL}/tickets`,
    params as Record<string, unknown>
  );
}

export async function getTicketDetailAction(
  id: string
): Promise<TicketDetailResponse> {
  return serverApi.get<TicketDetailResponse>(`${API_BASE_URL}/tickets/${id}`);
}

export async function createTicketAction(
  data: CreateTicketRequest
): Promise<CreateTicketResponse> {
  return serverApi.post<CreateTicketResponse>(`${API_BASE_URL}/tickets`, {
    ...data,
    type_id: data.type_id ?? TICKET_TYPE_VIRTUALIZATION,
  });
}

export async function updateTicketAction(
  id: string,
  data: { data: Record<string, unknown>; status: string; reason?: string }
): Promise<TicketDetailResponse> {
  return serverApi.put<TicketDetailResponse>(
    `${API_BASE_URL}/tickets/${id}`,
    data
  );
}

export async function deleteTicketAction(
  id: string
): Promise<{ message?: string }> {
  return serverApi.delete<{ message?: string }>(
    `${API_BASE_URL}/tickets/${id}`
  );
}

export async function getApprovalAction(
  approvalId: string
): Promise<ApprovalResponse> {
  return serverApi.get<ApprovalResponse>(`${API_BASE_URL}/jdy/approval`, {
    approval_id: approvalId,
  });
}
