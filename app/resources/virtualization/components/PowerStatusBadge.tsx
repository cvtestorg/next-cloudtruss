import { Badge } from "@/components/ui/badge";
import { Power, PowerOff } from "lucide-react";

interface PowerStatusBadgeProps {
  powerStatus: string;
}

export function PowerStatusBadge({ powerStatus }: PowerStatusBadgeProps) {
  const getVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "on" || normalizedStatus === "poweredon") {
      return "default";
    }
    if (normalizedStatus === "off" || normalizedStatus === "poweredoff") {
      return "secondary";
    }
    return "outline";
  };

  const getIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "on" || normalizedStatus === "poweredon") {
      return <Power className="h-3 w-3" />;
    }
    if (normalizedStatus === "off" || normalizedStatus === "poweredoff") {
      return <PowerOff className="h-3 w-3" />;
    }
    return null;
  };

  const getDisplayText = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "on" || normalizedStatus === "poweredon") {
      return "已开机";
    }
    if (normalizedStatus === "off" || normalizedStatus === "poweredoff") {
      return "已关机";
    }
    return status;
  };

  return (
    <Badge variant={getVariant(powerStatus)}>
      {getIcon(powerStatus)}
      {getDisplayText(powerStatus)}
    </Badge>
  );
}

