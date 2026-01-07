"use client";

import type { ApprovalResponse } from "@/types/ticket";
import { ApprovalTimeline } from "./approval-timeline";

interface ApprovalDetailContentProps {
  data: ApprovalResponse;
}

export function ApprovalDetailContent({
  data,
}: ApprovalDetailContentProps) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          暂无审批数据
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">审批详情111</h1>
      <div className="space-y-4">
        <ApprovalTimeline tasks={data.data[0].tasks} />
      </div>
    </div>
  );
}
