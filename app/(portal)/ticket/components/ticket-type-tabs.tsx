"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TICKET_TYPE_VIRTUALIZATION, TICKET_TYPE_PERMISSION } from "@/types/ticket";

interface TicketTypeTab {
  value: string;
  label: string;
}

const TICKET_TYPE_TABS: TicketTypeTab[] = [
  { value: "all", label: "全部" },
  { value: "virtualization", label: "虚拟机" },
  { value: "permission", label: "权限" },
];

export function TicketTypeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTypeId = useMemo(() => {
    const typeId = searchParams.get("typeId");
    if (!typeId || typeId === "all") {
      return "all";
    }
    // 将 UUID 转换为对应的 key，或者直接使用字符串 key
    if (typeId === TICKET_TYPE_VIRTUALIZATION || typeId === "virtualization") {
      return "virtualization";
    }
    if (typeId === TICKET_TYPE_PERMISSION || typeId === "permission") {
      return "permission";
    }
    return typeId;
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all") {
        params.delete("typeId");
      } else {
        // 直接使用字符串 key，page.tsx 会将其转换为 UUID
        params.set("typeId", value);
      }

      // 重置到第一页
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <Tabs value={currentTypeId} onValueChange={handleTabChange}>
      <TabsList className="w-full">
        {TICKET_TYPE_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

