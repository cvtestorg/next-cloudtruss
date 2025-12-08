"use client";

import { getAccessToken } from "@/lib/fetch/client";

/**
 * 企业微信群组服务
 *
 * 本模块实现了标准的 Server-Sent Events (SSE) 流式通信
 * 符合 W3C SSE 规范：https://html.spec.whatwg.org/multipage/server-sent-events.html
 *
 * SSE 协议格式：
 * - event: 事件类型（可选，默认为 "message"）
 * - data: 数据内容（可多行）
 * - id: 事件 ID（可选）
 * - retry: 重连时间（可选）
 * - 空行表示事件结束
 *
 * 后端返回格式示例：
 * ```
 * event: progress
 * data: {"step": "fetch_members", "message": "正在获取成员信息", "progress": 20}
 *
 * event: success
 * data: {"step": "completed", "message": "操作完成", "progress": 100}
 *
 * ```
 *
 * 支持的事件类型：
 * - progress: 处理中
 * - success: 成功完成
 * - error: 错误
 * - warning: 警告
 */

/**
 * SSE 事件类型
 */
export type SSEEventType = "progress" | "success" | "error" | "warning";

/**
 * SSE 数据 payload（在 data: 字段中的 JSON 内容）
 */
interface SSEDataPayload {
  step: string;
  message: string;
  progress?: number;
  data?: Record<string, unknown>;
  error?: Record<string, unknown>;
}

/**
 * SSE 消息完整结构（协议层 + 数据层）
 */
export interface SSEMessage {
  event: SSEEventType;
  step: string;
  message: string;
  progress?: number;
  data?: Record<string, unknown>;
  error?: Record<string, unknown>;
}

/**
 * 群组操作请求数据
 */
export interface CreateGroupRequest {
  group_id?: string | null;
  name: string;
  members: string[];
  create_by: string;
}

/**
 * SSE 回调函数
 */
export interface SSECallbacks {
  onMessage: (message: SSEMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * 获取 API 基础 URL
 */
const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

/**
 * 处理 SSE 流数据
 * 符合 W3C SSE 规范的标准解析器
 *
 * @param response HTTP 响应对象
 * @param callbacks SSE 回调函数
 */
async function handleSSEStream(
  response: Response,
  callbacks: SSECallbacks
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("无法读取响应体");
  }

  const decoder = new TextDecoder();

  try {
    // SSE 解析状态
    let buffer = ""; // 累积未完成的数据块
    let currentEvent: SSEEventType = "progress"; // 当前事件类型（默认值）
    let currentData = ""; // 当前数据内容（可能跨多行）

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete?.();
        break;
      }

      // 解码数据块并追加到缓冲区
      buffer += decoder.decode(value, { stream: true });

      // 按行分割（保留最后一行，可能不完整）
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      // 逐行处理
      for (const line of lines) {
        // 移除行尾的回车符（处理 \r\n 和 \n）
        const trimmedLine = line.replace(/\r$/, "");

        // 空行 = 事件结束，触发回调
        if (trimmedLine === "") {
          if (currentData) {
            processSSEMessage(currentEvent, currentData, callbacks);
            // 重置状态
            currentEvent = "progress";
            currentData = "";
          }
          continue;
        }

        // 注释行（以 : 开头）
        if (trimmedLine.startsWith(":")) {
          continue;
        }

        // 解析字段（格式：field: value）
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex === -1) {
          continue;
        }

        const field = trimmedLine.slice(0, colonIndex);
        let value = trimmedLine.slice(colonIndex + 1);

        // SSE 规范：移除值开头的单个空格
        if (value.startsWith(" ")) {
          value = value.slice(1);
        }

        // 处理 SSE 字段
        switch (field) {
          case "event":
            currentEvent = value as SSEEventType;
            break;

          case "data":
            // data 字段可能跨多行
            currentData = currentData ? `${currentData}\n${value}` : value;
            break;

          case "id":
          case "retry":
            // SSE 标准字段（当前未使用）
            break;

          default:
            // 忽略未知字段
            break;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 处理单个 SSE 消息
 *
 * @param event 事件类型
 * @param data 数据内容（JSON 字符串）
 * @param callbacks SSE 回调函数
 */
function processSSEMessage(
  event: SSEEventType,
  data: string,
  callbacks: SSECallbacks
): void {
  try {
    // 解析 JSON payload
    const payload: SSEDataPayload = JSON.parse(data);

    // 验证必需字段
    if (!payload.step || !payload.message) {
      console.warn("无效的 SSE 消息（缺少必需字段）:", payload);
      return;
    }

    // 组合完整消息
    const message: SSEMessage = {
      event,
      step: payload.step,
      message: payload.message,
      progress: payload.progress,
      data: payload.data,
      error: payload.error,
    };

    callbacks.onMessage(message);
  } catch (error) {
    console.error("解析 SSE 消息失败:", data, error);
  }
}

/**
 * 发送 SSE 请求
 *
 * @param url 请求 URL
 * @param data 请求数据
 * @param callbacks SSE 回调函数
 */
async function sendSSERequest(
  url: string,
  data: CreateGroupRequest,
  callbacks: SSECallbacks
): Promise<void> {
  try {
    // 获取认证令牌
    const token = await getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 发送 POST 请求
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    // 处理 HTTP 错误
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    // 处理 SSE 流
    await handleSSEStream(response, callbacks);
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error("未知错误"));
  }
}

/**
 * 创建企业微信群组
 *
 * @param data 创建群组的请求数据
 * @param callbacks SSE 回调函数
 */
export async function createWxworkGroup(
  data: CreateGroupRequest,
  callbacks: SSECallbacks
): Promise<void> {
  const url = `${getApiBaseUrl()}/wxwork/group/`;
  await sendSSERequest(url, data, callbacks);
}

/**
 * 更新企业微信群组
 *
 * @param data 更新群组的请求数据
 * @param callbacks SSE 回调函数
 */
export async function updateWxworkGroup(
  data: CreateGroupRequest,
  callbacks: SSECallbacks
): Promise<void> {
  const url = `${getApiBaseUrl()}/wxwork/group/update`;
  await sendSSERequest(url, data, callbacks);
}
