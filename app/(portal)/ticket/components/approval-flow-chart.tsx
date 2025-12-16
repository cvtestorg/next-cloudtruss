import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApprovalTaskItem } from "@/types/ticket";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalFlowChartProps {
  tasks: ApprovalTaskItem[];
}

export function ApprovalFlowChart({ tasks }: ApprovalFlowChartProps) {
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: // 已完成
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 2: // 已拒绝
        return <XCircle className="h-5 w-5 text-red-500" />;
      default: // 待处理
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "已完成";
      case 2:
        return "已拒绝";
      default:
        return "待处理";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>审批流程</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.task_id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {getStatusIcon(task.status)}
                {index < tasks.length - 1 && (
                  <div className="w-0.5 h-8 bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.flow_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.assignee.name} ({task.assignee.username})
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded",
                      task.status === 1 && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                      task.status === 2 && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                      task.status === 0 && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

