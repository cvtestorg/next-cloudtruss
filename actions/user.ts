"use server";

import { serverApi } from "@/lib/fetch/server";
import type { UserListResponse } from "@/types/user";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

export async function getUsersAction(params: {
  page: number;
  page_size: number;
  search: string;
}): Promise<UserListResponse> {
  return serverApi.get<UserListResponse>(`${API_BASE_URL}/users`, params);
}
