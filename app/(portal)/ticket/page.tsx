import { Suspense } from "react";
import { getTicketsAction } from "@/actions/ticket";
import { TicketPageClient } from "./components/ticket-page-client";
import { Loading } from "@/components/loading";
import {
  TICKET_TYPE_VIRTUALIZATION,
  TICKET_TYPE_PERMISSION,
} from "@/types/ticket";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    typeId?: string;
  }>;
}

async function TicketListData({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  // 将 typeId 字符串转换为对应的 UUID
  const getTypeId = (typeId: string): string => {
    const typeIdMap: Record<string, string> = {
      virtualization: TICKET_TYPE_VIRTUALIZATION,
      permission: TICKET_TYPE_PERMISSION,
    };
    return typeIdMap[typeId] || typeId;
  };

  const queryParams = {
    page,
    size: pageSize,
    ...(params.search && { title: params.search }),
    ...(params.status && params.status !== "all" && { status: params.status }),
    ...(params.typeId &&
      params.typeId !== "all" && {
      type_id: getTypeId(params.typeId),
    }),
  };

  const data = await getTicketsAction(queryParams);

  return <TicketPageClient data={data} currentPage={page} />;
}

export default async function TicketPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading variant="table" rows={10} columns={6} />}>
      <TicketListData searchParams={searchParams} />
    </Suspense>
  );
}
