"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface FilterParams {
  search: string;
  status: string;
  powerStatus: string;
  env: string;
}

export function VmSearchFilterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<FilterParams>(
    () => ({
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "all",
      powerStatus: searchParams.get("powerStatus") || "all",
      env: searchParams.get("env") || "all",
    }),
    [searchParams]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<FilterParams>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // 更新过滤参数
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      
      // 重置页码到第一页
      params.set("page", "1");
      
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value });
  };

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value });
  };

  const handlePowerStatusChange = (value: string) => {
    updateFilters({ powerStatus: value });
  };

  const handleEnvChange = (value: string) => {
    updateFilters({ env: value });
  };

  const handleReset = () => {
    router.push("/resources/virtualization");
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.powerStatus !== "all" ||
    filters.env !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索名称、主机名或地址..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="running">运行中</SelectItem>
            <SelectItem value="stopped">已停止</SelectItem>
            <SelectItem value="error">错误</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.powerStatus}
          onValueChange={handlePowerStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="电源状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部电源状态</SelectItem>
            <SelectItem value="on">开启</SelectItem>
            <SelectItem value="off">关闭</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.env} onValueChange={handleEnvChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="环境" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部环境</SelectItem>
            <SelectItem value="prod">生产</SelectItem>
            <SelectItem value="dev">开发</SelectItem>
            <SelectItem value="test">测试</SelectItem>
            <SelectItem value="staging">预发布</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
