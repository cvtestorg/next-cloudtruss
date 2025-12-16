import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getApprovalAction } from "@/actions/ticket";
import { ApprovalDetailContent } from "./components/approval-detail-content";
import { Loading } from "@/components/loading";

interface PageProps {
  searchParams: Promise<{
    approval_id?: string;
  }>;
}

async function ApprovalDetailData({
  approvalId,
}: {
  approvalId: string;
}) {
  try {
    const data = await getApprovalAction(approvalId);
    return <ApprovalDetailContent data={data} />;
  } catch (error) {
    console.error("获取审批详情失败:", error);
    notFound();
  }
}

export default async function ApprovalDetail({ searchParams }: PageProps) {
  const params = await searchParams;
  const approvalId = params.approval_id;

  if (!approvalId) {
    notFound();
  }

  return (
    <Suspense fallback={<Loading variant="minimal" />}>
      <ApprovalDetailData approvalId={approvalId} />
    </Suspense>
  );
}
