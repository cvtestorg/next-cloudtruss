import { getVirtualMachinesAction } from "@/actions/vm";
import { VmPageClient } from "./components/VmPageClient";

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
    <VmPageClient
      vms={data.items}
      currentPage={page}
      totalPages={data.pages}
    />
  );
}
