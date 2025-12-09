import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getVirtualMachineDetailAction } from "@/actions/vm";
import { VmDetailContent } from "./components/VmDetailContent";
import { Loading } from "@/components/loading";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function VmDetailData({ id }: { id: string }) {
  try {
    const data = await getVirtualMachineDetailAction(id);
    
    if (!data?.data) {
      notFound();
    }

    return <VmDetailContent data={data} />;
  } catch (error) {
    console.error("获取虚拟机详情失败:", error);
    notFound();
  }
}

export default async function VirtualMachineDetail({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <Suspense fallback={<Loading variant="minimal" />}>
      <VmDetailData id={id} />
    </Suspense>
  );
}
