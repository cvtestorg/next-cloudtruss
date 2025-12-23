import { Suspense } from "react";
import { ActionPageClient } from "./components/action-page-client";
import { Loading } from "@/components/loading";
import { getActionLogsAction } from "@/actions/action";
import { handleServerApiError } from "@/lib/errors";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    service?: string;
    status?: string;
    target?: string;
  }>;
}

async function ActionListData({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  const queryParams = {
    page,
    page_size: pageSize,
    ...(params.service && { service: params.service }),
    // 如果 status 为 "all" 或不存在，不添加 status 参数（后端会返回所有状态）
    // 否则使用指定的 status，如果没有则默认使用 RUNNING
    ...(params.status && params.status !== "all" && { status: params.status }),
    ...(!params.status && { status: "RUNNING" }),
    ...(params.target && { target: params.target }),
  };

  let data;
  try {
    data = await getActionLogsAction(queryParams);
  } catch (error) {
    // 如果遇到 401 错误（AccessToken 过期），清除 session 并重定向到登录页
    await handleServerApiError(error);
    // handleServerApiError 会抛出错误或重定向，这里不会执行
    throw error;
  }

  // 如果 data 不存在，返回空数据
  if (!data) {
    data = {
      success: false,
      code: 0,
      message: "",
      timestamp: new Date().toISOString(),
      data: {
        items: [],
        page: 1,
        size: pageSize,
        total: 0,
        pages: 0,
      },
    };
  }

  return <ActionPageClient data={data} currentPage={page} />;
}

export default async function ActionPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading variant="table" rows={10} columns={4} />}>
      <ActionListData searchParams={searchParams} />
    </Suspense>
  );
}