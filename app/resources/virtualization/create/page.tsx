import { getTicketDetailAction } from "@/actions/ticket";
import { VmCreateForm } from "./components/VmCreateForm";
import { getInitialFormValues } from "@/lib/vm/create-utils";

interface PageProps {
  searchParams: Promise<{
    ticketId?: string;
  }>;
}

export default async function VirtualMachineCreate({ searchParams }: PageProps) {
  const params = await searchParams;
  const ticketId = params.ticketId;

  let ticketDetail = null;

  // 如果有 ticketId, 在服务器端获取工单详情
  if (ticketId) {
    try {
      ticketDetail = await getTicketDetailAction(ticketId);
    } catch (error) {
      console.error("获取工单详情失败:", error);
      // 如果获取失败, 继续使用默认值
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
