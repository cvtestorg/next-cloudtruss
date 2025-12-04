"use server";

import { getUsersServer } from "@/services/user-server";
import type { UserListResponse } from "@/types/user";

/**
 * Server Action: 获取用户列表
 * 使用服务器端 API 调用，自动传递 access_token
 */
export async function getUsersAction(params: {
  page: number;
  page_size: number;
  search: string;
}): Promise<UserListResponse> {
  return await getUsersServer(params);
}
