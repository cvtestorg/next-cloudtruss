"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApprovalAction } from "@/actions/ticket";
import type { ApprovalResponse } from "@/types/ticket";

export default function ApprovalDetail() {
  const searchParams = useSearchParams();
  const approvalId = searchParams.get("approval_id");
  
  const [data, setData] = useState<ApprovalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!approvalId) {
      setIsLoading(false);
      return;
    }

    const fetchApproval = async () => {
      try {
        setIsLoading(true);
        const result = await getApprovalAction(approvalId);
        setData(result);
        console.log("审批数据:", result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("未知错误"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApproval();
  }, [approvalId]);

  if (!approvalId) {
    return <div>缺少审批ID参数</div>;
  }

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>加载失败: {error.message}</div>;
  }

  return (
    <div>
      <h1>审批详情</h1>
      {data && (
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}