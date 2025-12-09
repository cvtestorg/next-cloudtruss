import { Suspense } from "react";
import { getTicketDetailAction } from "@/actions/ticket";
import { VmCreateForm } from "./components/VmCreateForm";
import { getInitialFormValues } from "./lib/utils";
import { Loading } from "@/components/loading";

interface PageProps {
  searchParams: Promise<{
    ticketId?: string;
  }>;
}

async function VmCreateContent({ ticketId }: { ticketId?: string }) {
  let ticketDetail = null;

  // 如果有 ticketId，在服务器端获取工单详情
  if (ticketId) {
    try {
      ticketDetail = await getTicketDetailAction(ticketId);
    } catch (error) {
      console.error("获取工单详情失败:", error);
      // 如果获取失败，继续使用默认值
    }
  }

  const initialValues = getInitialFormValues(ticketId || null, ticketDetail);

  return (
    <VmCreateForm
      initialValues={initialValues}
      ticketId={ticketId}
      ticketDetail={ticketDetail}
    />
  );
}

export default async function VirtualMachineCreate({ searchParams }: PageProps) {
  const params = await searchParams;
  const ticketId = params.ticketId;

  return (
    <Suspense fallback={<Loading variant="minimal" />}>
      <VmCreateContent ticketId={ticketId} />
    </Suspense>
  );
}
