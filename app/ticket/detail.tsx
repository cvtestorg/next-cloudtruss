import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApprovalQuery } from "@/hooks/approval/use-ticket";

export default function ApprovalDetail() {
  const [searchParams] = useSearchParams();
  const approvalId = searchParams.get("approval_id");

  const { data, isLoading, error } = useApprovalQuery(approvalId);

  useEffect(() => {
    if (data) {
      console.log("审批数据:", data);
    }
  }, [data]);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>加载失败: {error instanceof Error ? error.message : "未知错误"}</div>;
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