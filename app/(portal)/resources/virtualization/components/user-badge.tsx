"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getUserAction } from "@/actions/user";
import type { UserInfo } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface UserBadgeProps {
  userId: string;
}

export function UserBadge({ userId }: UserBadgeProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open && !hasLoaded && userId) {
      setIsLoading(true);
      setError(null);

      getUserAction(userId)
        .then((response) => {
          if (response?.data) {
            setUserInfo(response.data);
            setHasLoaded(true);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "获取用户信息失败");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <HoverCard onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        <Badge variant="outline" className="cursor-pointer">
          {userId}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-60">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">{error}</div>
        ) : userInfo ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={userInfo.avatar || undefined} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {userInfo.nickname?.[0] || userInfo.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-popover-foreground">
                  {userInfo.nickname || userInfo.real_name || userInfo.username}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {userInfo.username}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {userInfo.email && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">邮箱:</span>
                  <span className="truncate text-popover-foreground">{userInfo.email}</span>
                </div>
              )}
              {userInfo.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">电话:</span>
                  <span className="text-popover-foreground">{userInfo.phone}</span>
                </div>
              )}
              {userInfo.real_name && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">姓名:</span>
                  <span className="text-popover-foreground">{userInfo.real_name}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">用户信息不可用</div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
