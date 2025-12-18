import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

/**
 * 无效用户 ID 展示组件的属性
 */
interface InvalidUserIdsProps {
  /** 无效的用户 ID 列表 */
  invalidUserIds: string[];
}

/**
 * 无效用户 ID 展示组件
 * 用于显示建群失败的用户域账号列表
 */
export function InvalidUserIds({ invalidUserIds }: InvalidUserIdsProps) {
  // 如果没有无效用户，不显示该组件
  if (invalidUserIds.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertTriangle className="size-4 text-yellow-600 dark:text-yellow-400" />
          建群失败的用户 ({invalidUserIds.length} 个)
        </div>
        <Textarea
          value={invalidUserIds.join("\n")}
          readOnly
          className="min-h-24 font-mono text-sm resize-none bg-muted/50"
          placeholder="暂无无效用户"
        />
        <p className="text-xs text-muted-foreground">
          这些域账号可能不存在或未启用企业微信，建群时已自动跳过
        </p>
      </div>
    </div>
  );
}

