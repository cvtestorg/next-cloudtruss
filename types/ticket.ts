export const TICKET_TYPE = "d35c0d72-4277-437e-8371-0fc6f1ef91bb";

/**
 * 创建工单请求参数类型
 */
export interface CreateTicketRequest {
  type_id?: string;
  title: string;
  data: Record<string, unknown>;
}

/**
 * 创建工单响应类型
 */
export interface CreateTicketResponse {
  id: string;
  type_id: string;
  title: string;
  data: Record<string, unknown>;
  user: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 获取工单列表请求参数类型
 */
export interface GetTicketsParams {
  page?: number;
  size?: number;
  title?: string;
  status?: string;
  type_id?: string;
}

/**
 * 工单项类型
 */
export interface Ticket {
  id: string;
  type_name: string;
  type_id: string;
  title: string;
  data: Record<string, unknown>;
  user: string;
  status?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 工单列表响应类型
 */
export interface TicketListResponse {
  data: Ticket[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TicketDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: Ticket;
  timestamp: string;
}

interface ApprovalAssignee {
  username: string;
  name: string;
  departments: number[];
  type: number;
  status: number;
  integrate_id: string;
}

interface ApprovalCreator {
  username: string;
  name: string;
  type: number;
  status: number;
  integrate_id: string;
}

export interface ApprovalTaskItem {
  app_id: string;
  form_id: string;
  form_title: string;
  title: string;
  instance_id: string;
  task_id: string;
  flow_id: number;
  flow_name: string;
  url: string;
  assignee: ApprovalAssignee;
  creator: ApprovalCreator;
  create_time: string;
  create_action: string;
  finish_time: string;
  finish_action: string;
  status: number;
}

interface ApprovalData {
  app_id: string;
  form_id: string;
  form_title: string;
  instance_id: string;
  url: string;
  tasks: ApprovalTaskItem[];
  update_time: string;
  create_time: string;
  finish_time: string | null;
  status: number;
  creator: ApprovalCreator;
  message: string | null;
}

export interface ApprovalResponse {
  success: boolean;
  code: number;
  message: string;
  data: { data: ApprovalData; instance_id: string; message: string | null }[];
}
