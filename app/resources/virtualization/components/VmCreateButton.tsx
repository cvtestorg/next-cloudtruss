"use client";

import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VmCreateButton() {
  const router = useRouter();

  const handleCreateVm = () => {
    router.push("/resources/virtualization/create");
  };

  return (
    <Button onClick={handleCreateVm} className="w-full sm:w-auto shrink-0">
      <PlusCircle className="h-4 w-4 mr-2" />
      申请虚拟机
    </Button>
  );
}
