export interface UserInfo {
  id: string;
  created_at: string;
  updated_at: string;
  status: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string | null;
  phone: string;
  real_name: string;
  is_verified: boolean;
  last_login_at: string;
  extra: Record<string, unknown>;
  remark: string | null;
}

export interface UserInfoResponse {
  success: boolean;
  code: number;
  message: string;
  data: UserInfo;
  timestamp: string;
}

export interface UserListResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    items: UserInfo[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  timestamp: string;
}