import { api } from "@/lib/fetch/client";
import type { ProjectListResponse } from "@/types/project";

const API_BASE_URL = "https://usercenter.gz.cvte.cn";

export async function getProjects(params: {
  page: number;
  page_size: number;
  search: string;
  depth: number;
}): Promise<ProjectListResponse> {
  return api.get<ProjectListResponse>(`${API_BASE_URL}/projects`, params);
}
