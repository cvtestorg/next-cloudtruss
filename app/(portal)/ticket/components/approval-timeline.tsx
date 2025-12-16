import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ApprovalTaskItem } from "@/types/ticket";

interface ApprovalTimelineProps {
  tasks: ApprovalTaskItem[];
}

export function ApprovalTimeline({ tasks }: ApprovalTimelineProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">已完成</Badge>;
      case 2:
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">已拒绝</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">处理中</Badge>;
    }
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return null;
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const diff = Math.floor((end - start) / 1000);
      
      if (diff < 60) {
        return `${diff}秒`;
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`;
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
      }
    } catch {
      return null;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.length > 2 ? name.slice(-2) : name;
  };

  return (
    <Card>
      <CardContent>
        <Accordion type="multiple" defaultValue={tasks.map((_, i) => `item-${i}`)}>
          {tasks.map((task, index) => {
            const isSystem = task.assignee.username === "system" || task.creator.username === "system";
            const displayName = isSystem ? (task.assignee.name || "系统机器人") : task.assignee.name;
            const displayUsername = isSystem ? "系统帐号" : task.assignee.username;
            const action = task.finish_action || task.create_action || "提交";
            const duration = task.finish_time 
              ? calculateDuration(task.create_time, task.finish_time)
              : null;

            return (
              <AccordionItem key={task.task_id} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{task.flow_name}</span>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(task.status)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(task.create_time)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {isSystem ? (
                          <div className="size-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                            系
                          </div>
                        ) : (
                          <Avatar className="size-8">
                            <AvatarImage 
                              src={`https://multiavatar.gz.cvte.cn/avatar?name=${encodeURIComponent(displayUsername)}`}
                              alt={displayName}
                            />
                            <AvatarFallback>
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{displayName}</p>
                          {!isSystem && (
                            <p className="text-sm text-muted-foreground">
                              {displayUsername}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{action}</Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span>开始处理: {formatDate(task.create_time)}</span>
                        {duration && (
                          <span>处理耗时: {duration}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

