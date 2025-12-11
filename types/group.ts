import type { SSEMessage } from "@/services/group";

/**
 * 日志消息类型（扩展 SSE 消息）
 */
export interface LogMessage extends SSEMessage {
  id: number;
  timestamp: Date;
  message: string; // 明确指定 message 类型为 string
}

/**
 * SSE 回调配置
 */
export interface SSECallbacks {
  onMessage: (message: SSEMessage) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

/**
 * 群组请求数据
 */
export interface GroupRequestData {
  group_id: string | null;
  name: string;
  members: string[];
  create_by: string;
}
