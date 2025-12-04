import { serverApi } from "@/lib/fetch-server";
import type { UserListResponse } from "@/types/user";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

/**
 * 服务器端获取用户列表
 * 用于 Server Components 和 Server Actions
 */
export async function getUsersServer(params: {
  page: number;
  page_size: number;
  search: string;
}): Promise<UserListResponse> {
  return serverApi.get<UserListResponse>(`${API_BASE_URL}/users`, params);
}

