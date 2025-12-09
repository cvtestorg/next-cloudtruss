"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VmSearchFilterClient } from "./VmSearchFilterClient";
import { VmTable } from "./VmTable";
import { VmPaginationClient } from "./VmPaginationClient";
import type { VirtualMachineItem } from "@/types/vm";

interface VmPageClientProps {
  vms: VirtualMachineItem[];
  currentPage: number;
  totalPages: number;
}

export function VmPageClient({
  vms,
  currentPage,
  totalPages,
}: VmPageClientProps) {
  const router = useRouter();

  const handleCreateVm = () => {
    router.push("/resources/virtualization/create");
  };

  const handleVmAction = (action: string, vm: VirtualMachineItem) => {
    console.log(`执行操作: ${action}`, vm);
    // TODO: 根据不同的 action 执行对应的操作
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full min-w-0">
          <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
            <VmSearchFilterClient />
          </Suspense>
        </div>
        <Button onClick={handleCreateVm} className="w-full sm:w-auto shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          申请虚拟机
        </Button>
      </div>

      <div className="rounded-lg border w-full min-w-0 overflow-hidden">
        <div className="overflow-x-auto">
          <VmTable vms={vms} onVmAction={handleVmAction} />
        </div>
      </div>

      {totalPages > 1 && (
        <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
          <VmPaginationClient currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      )}
    </div>
  );
}
