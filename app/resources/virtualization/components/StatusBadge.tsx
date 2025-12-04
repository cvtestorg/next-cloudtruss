import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Circle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "running" || normalizedStatus === "active") {
      return "default";
    }
    if (normalizedStatus === "stopped" || normalizedStatus === "inactive") {
      return "secondary";
    }
    if (normalizedStatus === "error" || normalizedStatus === "failed") {
      return "destructive";
    }
    return "outline";
  };

  const getIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "running" || normalizedStatus === "active") {
      return <CheckCircle2 className="h-3 w-3" />;
    }
    if (normalizedStatus === "stopped" || normalizedStatus === "inactive") {
      return <XCircle className="h-3 w-3" />;
    }
    if (normalizedStatus === "error" || normalizedStatus === "failed") {
      return <AlertCircle className="h-3 w-3" />;
    }
    return <Circle className="h-3 w-3" />;
  };

  return (
    <Badge variant={getVariant(status)}>
      {getIcon(status)}
      {status}
    </Badge>
  );
}

