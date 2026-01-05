import { Suspense } from "react";
import { getVirtualMachinesAction } from "@/actions/vm";
import { VmSearchFilterClient } from "./components/vm-search-filter-client";
import { VmTable } from "./components/vm-table";
import { VmPaginationClient } from "./components/vm-pagination-client";
import { VmCreateButton } from "./components/vm-create-button";
import { UnauthorizedError } from "@/lib/errors";
import { handleUnauthorizedAction } from "@/actions/auth";
import { headers } from "next/headers";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    like_name?: string;
    like_env?: string;
    vcenter?: string;
  }>;
}

export default async function VirtualizationPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  let data;
  try {
    data = await getVirtualMachinesAction({
      page,
      size: pageSize,
      like_name: params.like_name,
      like_env: params.like_env,
      vcenter: params.vcenter,
    });
  } catch (error) {
    // 如果遇到 401 错误（AccessToken 过期），清除 session 并重定向到登录页
    if (error instanceof UnauthorizedError) {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || headersList.get("referer") || "/";
      await handleUnauthorizedAction(pathname);
    }
    // 其他错误重新抛出
    throw error;
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full min-w-0">
          <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
            <VmSearchFilterClient />
          </Suspense>
        </div>
        <VmCreateButton />
      </div>

      <div className="rounded-lg border w-full min-w-0 overflow-hidden">
        <div className="overflow-x-auto">
          <VmTable vms={data.items} />
        </div>
      </div>

      {data.pages > 1 && (
        <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
          <VmPaginationClient currentPage={page} totalPages={data.pages} />
        </Suspense>
      )}
    </div>
  );
}
