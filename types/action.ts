import type { Pagination } from "./pagination";

export interface ActionLog {
  id: string;
  created_at: string;
  updated_at: string;
  service: string;
  action: string;
  target: string;
  target_id: string;
  data: Record<string, unknown>;
  status: string;
}

interface ActionLogList extends Pagination {
  items: ActionLog[];
}

export interface ActionLogListResponse {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  data: ActionLogList;
}

export interface CreateActionLogResponse {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  data: ActionLog;
}
