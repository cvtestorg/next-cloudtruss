// @ts-nocheck
import { useRef, useEffect, type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Check,
  AlertTriangle,
  Users,
  UserX,
  Hash,
  Clock,
} from "lucide-react";
import type { SSEEventType } from "@/services/group";
import type { LogMessage } from "./types";

/**
 * 群组日志组件的属性
 */
interface GroupLogsProps {
  /** 日志列表 */
  logs: LogMessage[];
  /** 当前进度（0-100） */
  currentProgress: number;
  /** 是否正在提交 */
  isSubmitting: boolean;
  /** 是否为更新模式 */
  isUpdateMode: boolean;
  /** 清空日志回调 */
  onClearLogs: () => void;
}

/**
 * 根据事件类型获取样式配置
 * @param event - SSE 事件类型
 * @returns 样式配置对象
 */
const getEventStyles = (event: SSEEventType): { bgColor: string; textColor: string; icon: ReactNode } => {
  switch (event) {
    case "error":
      return {
        bgColor: "bg-destructive/10 border-destructive/30",
        textColor: "text-destructive",
        icon: <XCircle className="size-4" />,
      };
    case "warning":
      return {
        bgColor: "bg-yellow-500/10 border-yellow-500/30",
        textColor: "text-yellow-600 dark:text-yellow-400",
        icon: <AlertTriangle className="size-4" />,
      };
    case "success":
      return {
        bgColor: "bg-green-500/10 border-green-500/30",
        textColor: "text-green-600 dark:text-green-400",
        icon: <CheckCircle2 className="size-4" />,
      };
    default:
      return {
        bgColor: "bg-muted/50 border-transparent",
        textColor: "text-foreground",
        icon: <Check className="size-4 text-blue-600 dark:text-blue-400" />,
      };
  }
};

/**
 * 渲染日志详细数据
 * 根据不同的步骤展示不同的数据格式
 */
const renderLogData = (log: LogMessage): ReactNode | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = log.data as any;
  
  // 打印后端数据到控制台用于调试
  console.log(`[${log.step}] 步骤数据:`, {
    step: log.step,
    event: log.event,
    message: log.message,
    data: data,
    fullLog: log
  });
  
  if (!data || Object.keys(data).length === 0) return null;

  // 根据不同的步骤渲染不同的内容
  switch (log.step) {
    case "start":
      return (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {data.group_name && (
            <Badge variant="secondary" className="text-[10px] h-5 font-normal px-1.5">
              <Hash className="size-2.5 mr-0.5" />
              {String(data.group_name)}
            </Badge>
          )}
          {data.total_members !== undefined && (
            <Badge variant="secondary" className="text-[10px] h-5 font-normal px-1.5">
              <Users className="size-2.5 mr-0.5" />
              {data.total_members} 人
            </Badge>
          )}
        </div>
      );

    case "fetch_members_success":
      // 有效人数和异常人数已经在时间行显示，这里不需要再显示
      return null;

    case "fetch_owner_success":
      return (
        <div className="mt-1">
          {data.owner_id && (
            <Badge variant="secondary" className="font-mono text-[10px] h-5 font-normal px-1.5">
              {String(data.owner_id)}
            </Badge>
          )}
        </div>
      );

    case "create_chat_success":
    case "completed":
      return (
        <div className="mt-1 space-y-1.5">
          {data.chatid && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">群组 ID:</span>
              <Badge variant="default" className="font-mono text-[10px] h-5 font-normal px-1.5">
                {String(data.chatid)}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {data.member_count !== undefined && (
              <Badge variant="outline" className="text-[10px] h-5 font-normal px-1.5">
                <Users className="size-2.5 mr-0.5" />
                {data.member_count} 人
              </Badge>
            )}
            {Array.isArray(data.invalid_userids) && data.invalid_userids.length > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 font-normal text-yellow-600 border-yellow-600 px-1.5">
                <UserX className="size-2.5 mr-0.5" />
                {data.invalid_userids.length} 人未加入
              </Badge>
            )}
          </div>
        </div>
      );

    case "remove_invalid_user":
      return (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {data.invalid_userid && (
            <Badge variant="destructive" className="font-mono text-[10px] h-5 font-normal px-1.5">
              {String(data.invalid_userid)}
            </Badge>
          )}
          {data.remaining_count !== undefined && (
            <Badge variant="secondary" className="text-[10px] h-5 font-normal px-1.5">
              <Users className="size-2.5 mr-0.5" />
              剩余 {data.remaining_count} 人
            </Badge>
          )}
        </div>
      );

    default:
      // 其他情况，显示所有数据的键值对
      return (
        <div className="mt-1 space-y-0.5">
          {Object.entries(data).map(([key, value]) => {
            // 跳过空值和已经在上面处理过的字段
            if (value === null || value === undefined || value === "") return null;
            
            // 特殊处理数组
            if (Array.isArray(value)) {
              if (value.length === 0) return null;
              return (
                <div key={key} className="text-[10px]">
                  <span className="text-muted-foreground">{key}:</span>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {value.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="font-mono text-[10px] h-5 font-normal px-1.5">
                        {String(item)}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="text-[10px]">
                <span className="text-muted-foreground">{key}:</span>{" "}
                <span className="font-mono">{String(value)}</span>
              </div>
            );
          })}
        </div>
      );
  }
};

/**
 * 渲染错误信息
 */
const renderError = (error: Record<string, unknown>): ReactNode => {
  if (!error || Object.keys(error).length === 0) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorData = error as any;

  return (
    <div className="mt-1 p-1.5 rounded bg-destructive/5 border border-destructive/20">
      <div className="space-y-0.5">
        {errorData.code && (
          <div className="text-[10px]">
            <span className="text-muted-foreground">错误码:</span>{" "}
            <Badge variant="destructive" className="font-mono text-[10px] h-5 font-normal px-1.5">
              {String(errorData.code)}
            </Badge>
          </div>
        )}
        {errorData.message && (
          <div className="text-[10px] text-destructive leading-snug">
            {String(errorData.message)}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 群组日志展示组件
 * 用于实时显示群组创建/更新过程中的详细日志信息
 */
export function GroupLogs({
  logs,
  currentProgress,
  isSubmitting,
  isUpdateMode,
  onClearLogs,
}: GroupLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到日志底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="flex flex-col h-full overflow-hidden gap-0">
      <CardHeader className="shrink-0 pb-3 mb-4">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            {isUpdateMode ? "更新日志" : "创建日志"}
          </span>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLogs}
              disabled={isSubmitting}
              className="h-7 text-xs"
            >
              清空日志
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          实时显示群组{isUpdateMode ? "更新" : "创建"}过程中的详细信息
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-6 pb-4" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* 进度条 */}
        {isSubmitting && (
          <div className="mb-3 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium">处理进度</span>
              <span className="text-xs text-muted-foreground">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-1.5" />
          </div>
        )}

        {/* 固定高度的滚动区域 - 使用内联样式确保最高优先级 */}
        <div className="flex-1 rounded-md border" style={{ minHeight: 0, overflow: 'hidden' }}>
          <ScrollArea className="h-full w-full">
              <div className="p-3">
              {logs.length === 0 ? (
                <div className="flex min-h-[150px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="size-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">暂无日志</p>
                    <p className="text-xs mt-1">
                      提交表单后将在此显示{isUpdateMode ? "更新" : "创建"}过程
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {logs.map((log) => {
                    const styles = getEventStyles(log.event);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const logData = log.data as any;
                    
                    // 提取并渲染消息内容，避免类型检查问题
                    const messageElement: React.ReactElement = (() => {
                      const msg = log.message;
                      return (
                        <p className={`text-xs font-medium leading-snug ${styles.textColor}`}>
                          {String(msg)}
                        </p>
                      );
                    })();

                    return (
                      <div
                        key={log.id}
                        className={`rounded border p-2 ${styles.bgColor}`}
                      >
                        <div className="flex items-start gap-2">
                          {/* 图标 */}
                          <div className={`mt-0.5 shrink-0 ${styles.textColor}`}>
                            {styles.icon}
                          </div>
                          
                          {/* 内容 */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {/* 时间和进度 */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] h-5 font-normal gap-0.5 px-1.5">
                                <Clock className="size-2.5" />
                                {log.timestamp.toLocaleTimeString()}
                              </Badge>
                              {/* 显示 fetch_members_success 步骤的有效人数和异常人数 */}
                              {log.step === "fetch_members_success" && logData && (
                                <>
                                  {logData.valid_count !== undefined && (
                                    <Badge variant="outline" className="text-[10px] h-5 font-normal text-green-600 border-green-600 px-1.5">
                                      <Users className="size-2.5 mr-0.5" />
                                      有效 {logData.valid_count} 人
                                    </Badge>
                                  )}
                                  {logData.invalid_count !== undefined && Number(logData.invalid_count) > 0 && (
                                    <Badge variant="outline" className="text-[10px] h-5 font-normal text-yellow-600 border-yellow-600 px-1.5">
                                      <UserX className="size-2.5 mr-0.5" />
                                      异常 {logData.invalid_count} 人
                                    </Badge>
                                  )}
                                </>
                              )}
                              {/* 弹性占位，将进度推向右侧 */}
                              <div className="flex-1" />
                              {log.progress !== undefined && (
                                <Badge variant="secondary" className="text-[10px] h-5 font-normal px-1.5">
                                  {log.progress}%
                                </Badge>
                              )}
                            </div>

                            {/* 消息 */}
                            {messageElement as ReactNode}

                            {/* 渲染数据 */}
                            {renderLogData(log)}

                            {/* 渲染错误信息 */}
                            {log.data?.error && renderError(log.data.error as Record<string, unknown>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* 自动滚动锚点 */}
                  <div ref={logsEndRef} />
                </div>
              )}
              </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}


