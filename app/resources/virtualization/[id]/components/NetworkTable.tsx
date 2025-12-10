"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "../../components/StatusBadge";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { VirtualNetwork } from "@/types/vm";

interface NetworkTableProps {
  networks: VirtualNetwork[];
}

export function NetworkTable({ networks }: NetworkTableProps) {
  if (!networks || networks.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        暂无网卡数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>网卡名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>是否主网卡</TableHead>
            <TableHead>IP 地址</TableHead>
            <TableHead>MAC 地址</TableHead>
            <TableHead>是否删除</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {networks.map((network) => (
            <TableRow key={network.id}>
              <TableCell>{network.name}</TableCell>
              <TableCell>
                <StatusBadge status={network.status} />
              </TableCell>
              <TableCell>
                <Badge variant={network.is_primary ? "default" : "secondary"}>
                  {network.is_primary ? "true" : "false"}
                </Badge>
              </TableCell>
              <TableCell>
                {network.ip ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{network.ip}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(network.ip);
                              toast.success("已复制到剪贴板", {
                                icon: <Copy className="h-4 w-4" />,
                              });
                            } catch {
                              toast.error("复制失败");
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>复制 IP 地址</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {network.mac ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{network.mac}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(network.mac);
                              toast.success("已复制到剪贴板", {
                                icon: <Copy className="h-4 w-4" />,
                              });
                            } catch {
                              toast.error("复制失败");
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>复制 MAC 地址</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={network.is_deleted ? "destructive" : "secondary"}>
                  {network.is_deleted ? "true" : "false"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

