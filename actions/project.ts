"use server";

import { serverApi } from "@/lib/fetch/server";
import type { ProjectListResponse } from "@/types/project";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

export async function getProjectsAction(params: {
  page: number;
  page_size: number;
  search: string;
  depth: number;
}): Promise<ProjectListResponse> {
  return serverApi.get<ProjectListResponse>(`${API_BASE_URL}/projects`, params);
}
