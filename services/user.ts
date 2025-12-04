import { api } from "@/lib/fetch/client";
import type { UserListResponse } from "@/types/user";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

export async function getUsers(params: {
  page: number;
  page_size: number;
  search: string;
}): Promise<UserListResponse> {
  return api.get<UserListResponse>(`${API_BASE_URL}/users`, params);
}

