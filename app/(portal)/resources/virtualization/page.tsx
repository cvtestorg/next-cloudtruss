import { Suspense } from "react";
import { getVirtualMachinesAction } from "@/actions/vm";
import { VmSearchFilterClient } from "./components/vm-search-filter-client";
import { VmTable } from "./components/vm-table";
import { VmPaginationClient } from "./components/vm-pagination-client";
import { VmCreateButton } from "./components/vm-create-button";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    powerStatus?: string;
    env?: string;
  }>;
}

export default async function VirtualizationPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  const data = await getVirtualMachinesAction({
    page,
    size: pageSize,
    search: params.search,
    status: params.status,
    powerStatus: params.powerStatus,
    env: params.env,
  });

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
