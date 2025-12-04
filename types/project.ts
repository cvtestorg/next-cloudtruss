export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  status: number;
  name: string;
  code: string;
  depth: number;
}

export interface ProjectListResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    items: Project[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}
