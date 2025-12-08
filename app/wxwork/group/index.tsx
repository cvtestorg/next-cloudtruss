import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createWxworkGroup, updateWxworkGroup, type SSEMessage } from "@/services/group";
import { GroupForm, GroupLogs, type FormData, type LogMessage } from "./components";
import { createFormSchema } from "@/schemas/group";

/**
 * 企业微信群组管理页面
 * 支持创建和更新群组，提供实时日志反馈
 */
export default function WxworkGroup() {
  // 模式状态：false 为创建模式，true 为更新模式
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // 表单状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [invalidUserIds, setInvalidUserIds] = useState<string[]>([]);

  // 初始化表单（包含调试默认值）
  const form = useForm<FormData>({
    resolver: zodResolver(createFormSchema(false))
  });

  // 当模式切换时，手动触发验证
  useEffect(() => {
    // 清除之前的错误
    form.clearErrors();

    // 如果表单已经提交过或者有值，触发重新验证
    const hasValues =
      form.getValues("name") || form.getValues("members") || form.getValues("create_by");
    if (form.formState.isSubmitted || hasValues) {
      // 使用当前模式的 schema 手动验证
      const schema = createFormSchema(isUpdateMode);
      const values = form.getValues();
      const result = schema.safeParse(values);

      if (!result.success) {
        // 设置验证错误
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            form.setError(issue.path[0] as keyof FormData, {
              type: "manual",
              message: issue.message,
            });
          }
        });
      }
    }
  }, [isUpdateMode, form]);

  /**
   * 添加日志消息
   */
  const addLog = (message: SSEMessage) => {
    setLogs((prev) => [
      ...prev,
      {
        ...message,
        id: Date.now() + Math.random(),
        timestamp: new Date(),
      },
    ]);

    // 更新进度
    if (message.progress !== undefined) {
      setCurrentProgress(message.progress);
    }
  };

  /**
   * 清空日志
   */
  const clearLogs = () => {
    setLogs([]);
    setCurrentProgress(0);
    setInvalidUserIds([]);
  };

  /**
   * 处理模式切换
   */
  const handleModeChange = (checked: boolean) => {
    setIsUpdateMode(checked);
  };

  /**
   * 表单提交处理
   */
  const onSubmit = async (data: FormData) => {
    // 立即清空日志，确保每次提交都能看到最新的日志
    clearLogs();
    
    // 使用当前模式的 schema 进行验证
    const schema = createFormSchema(isUpdateMode);
    const validationResult = schema.safeParse(data);
    
    if (!validationResult.success) {
      // 如果验证失败，设置错误并返回
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          form.setError(issue.path[0] as keyof FormData, {
            type: "manual",
            message: issue.message,
          });
        }
      });
      return;
    }

    setIsSubmitting(true);

    // 解析成员列表：每行一个成员
    const membersList = data.members
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // 构造请求数据
    const requestData = {
      group_id: data.group_id || null,
      name: data.name,
      members: membersList,
      create_by: data.create_by,
    };

    // 根据模式显示不同的日志信息
    const actionText = isUpdateMode ? "更新" : "创建";
    const serviceFunction = isUpdateMode ? updateWxworkGroup : createWxworkGroup;

    try {
      // 发起 SSE 请求
      await serviceFunction(requestData, {
        // 接收到消息时的回调
        onMessage: (message) => {
          addLog(message);
          
          // 提取 invalid_userids（如果存在）
          if (message.data?.invalid_userids) {
            const ids = message.data.invalid_userids;
            if (Array.isArray(ids)) {
              setInvalidUserIds(ids);
            }
          }
          
          // 根据事件类型显示不同的 Toast 通知
          if (message.event === "error") {
            toast.error(`${actionText}群组失败`, {
              description: message.message,
            });
          } else if (message.event === "warning") {
            toast.warning(`警告`, {
              description: message.message,
            });
          }
        },
        // 错误处理回调
        onError: (error) => {
          addLog({
            event: "error",
            step: "error",
            message: error.message,
            progress: 0,
          });
          
          toast.error(`${actionText}群组失败`, {
            description: error.message,
          });
          setIsSubmitting(false);
        },
        // 完成回调
        onComplete: () => {
          // 检查最后一条消息是否为成功
          const lastLog = logs[logs.length - 1];
          const isSuccess = lastLog?.event === "success";
          
          if (isSuccess) {
            toast.success(`群组${actionText}成功`, {
              description: `群组 "${data.name}" 已成功${actionText}`,
            });
          }
          
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      
      addLog({
        event: "error",
        step: "error",
        message: `请求失败: ${errorMessage}`,
        progress: 0,
      });
      
      toast.error(`${actionText}群组失败`, {
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* 主要内容区域：左右布局，两列高度始终一致 */}
      <div className="flex-1 min-h-0 w-full flex items-stretch gap-6">
        {/* 左侧：表单区域 */}
        <div className="flex-1 min-w-0">
          <GroupForm
            form={form}
            isSubmitting={isSubmitting}
            isUpdateMode={isUpdateMode}
            invalidUserIds={invalidUserIds}
            onSubmit={onSubmit}
            onModeChange={handleModeChange}
          />
        </div>

        {/* 右侧：实时日志区域 */}
        <div className="flex-1 min-w-0">
          <GroupLogs
            logs={logs}
            currentProgress={currentProgress}
            isSubmitting={isSubmitting}
            isUpdateMode={isUpdateMode}
            onClearLogs={clearLogs}
          />
        </div>
      </div>

      {/* 开发者说明 - 固定在最底部 */}
      <div className="shrink-0 w-full h-8 flex items-center justify-center text-xs text-muted-foreground">
        @author: <span className="font-mono">peizhenfei</span>
      </div>
    </div>
  );
}
