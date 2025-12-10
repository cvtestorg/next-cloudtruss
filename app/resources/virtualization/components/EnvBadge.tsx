import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EnvBadgeProps {
  env: string;
  className?: string;
}

/**
 * 根据环境值返回对应的 Badge variant 和样式
 */
function getEnvBadgeConfig(env: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
} {
  const normalizedEnv = env?.toLowerCase() || "";

  switch (normalizedEnv) {
    case "prod":
    case "production":
    case "生产":
      return {
        variant: "destructive",
      };
    case "dev":
    case "development":
    case "开发":
      return {
        variant: "default",
      };
    case "test":
    case "测试":
      return {
        variant: "secondary",
      };
    case "staging":
    case "预发布":
      return {
        variant: "outline",
        className: "border-orange-500 text-orange-700 dark:text-orange-400",
      };
    case "uat":
      return {
        variant: "outline",
        className: "border-purple-500 text-purple-700 dark:text-purple-400",
      };
    case "integration":
    case "联调":
      return {
        variant: "outline",
        className: "border-green-500 text-green-700 dark:text-green-400",
      };
    default:
      return {
        variant: "outline",
      };
  }
}

export function EnvBadge({ env, className }: EnvBadgeProps) {
  const config = getEnvBadgeConfig(env);

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {env}
    </Badge>
  );
}
