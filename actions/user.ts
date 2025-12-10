"use server";

import { serverApi } from "@/lib/fetch/server";
import type { UserInfoResponse, UserListResponse } from "@/types/user";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

/* 获取用户列表 */
export async function getUsersAction(params: {
  page: number;
  page_size: number;
  search: string;
}): Promise<UserListResponse> {
  return serverApi.get<UserListResponse>(`${API_BASE_URL}/users`, params);
}

/* 根据域账号，获取用户信息 */
export async function getUserAction(id: string): Promise<UserInfoResponse> {
  return serverApi.get<UserInfoResponse>(`${API_BASE_URL}/users/${id}`);
}

/* 获取当前登录的用户信息 */
export async function getCurrentUserAction(): Promise<UserInfoResponse> {
  return serverApi.get<UserInfoResponse>(`${API_BASE_URL}/users/me`);
}

/* 更新当前登录的用户信息 */
export async function updateCurrentUserAction(data: {
  real_name?: string;
  phone?: string;
  avatar?: string;
}): Promise<UserInfoResponse> {
  return serverApi.put<UserInfoResponse>(`${API_BASE_URL}/users/me`, data);
}
