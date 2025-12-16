import { Suspense } from "react";
import { getTicketsAction } from "@/actions/ticket";
import { TicketPageClient } from "./components/ticket-page-client";
import { Loading } from "@/components/loading";
import { TICKET_TYPE } from "@/types/ticket";

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

  const queryParams = {
    page,
    size: pageSize,
    ...(params.search && { title: params.search }),
    ...(params.status && params.status !== "all" && { status: params.status }),
    ...(params.typeId &&
      params.typeId !== "all" && {
      type_id: params.typeId === "virtualization" ? TICKET_TYPE : params.typeId,
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
