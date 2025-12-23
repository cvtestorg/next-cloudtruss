"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
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
  searchType: "service" | "target";
  searchValue: string;
  status: string;
}

export function ActionSearchFilterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 根据 URL 参数判断当前搜索类型
  const currentSearchType = useMemo<"service" | "target">(() => {
    if (searchParams.get("service")) return "service";
    if (searchParams.get("target")) return "target";
    return "service"; // 默认搜索服务
  }, [searchParams]);

  // 使用状态来跟踪当前选择的搜索类型
  const [searchType, setSearchType] = useState<"service" | "target">(currentSearchType);

  // 本地输入框值（用于即时显示，不立即触发请求）
  const [localSearchValue, setLocalSearchValue] = useState<string>(
    searchParams.get("service") || searchParams.get("target") || ""
  );

  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 当 URL 参数变化时，同步更新本地状态
  useEffect(() => {
    setSearchType(currentSearchType);
    const urlValue = searchParams.get("service") || searchParams.get("target") || "";
    setLocalSearchValue(urlValue);
  }, [currentSearchType, searchParams]);

  const filters = useMemo<FilterParams>(
    () => ({
      searchType: searchType,
      searchValue:
        searchParams.get("service") || searchParams.get("target") || "",
      status: searchParams.get("status") || "all",
    }),
    [searchParams, searchType]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<FilterParams>) => {
      const params = new URLSearchParams(searchParams.toString());

      // 清除旧的搜索参数
      params.delete("service");
      params.delete("target");

      // 根据搜索类型设置对应的参数
      const finalSearchType = newFilters.searchType ?? searchType;
      const finalSearchValue = newFilters.searchValue ?? filters.searchValue;

      // 更新本地状态
      if (newFilters.searchType !== undefined) {
        setSearchType(newFilters.searchType);
      }

      if (finalSearchValue) {
        params.set(finalSearchType, finalSearchValue);
      }

      // 处理状态过滤
      const status = newFilters.status ?? filters.status;
      if (status && status !== "all") {
        params.set("status", status);
      } else {
        params.delete("status");
      }

      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, filters, searchType]
  );

  const handleSearchTypeChange = (value: "service" | "target") => {
    const currentValue = localSearchValue;
    // 清除防抖定时器，立即更新
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // 切换搜索类型时立即更新
    updateFilters({ searchType: value, searchValue: currentValue });
  };

  const handleSearchValueChange = (value: string) => {
    // 立即更新本地显示值
    setLocalSearchValue(value);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 如果输入框为空，立即清除搜索参数
    if (!value) {
      updateFilters({ searchValue: "" });
      return;
    }

    // 设置新的防抖定时器，500ms 后更新 URL
    debounceTimerRef.current = setTimeout(() => {
      updateFilters({ searchValue: value });
    }, 500);
  };

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value });
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    router.push("/actions");
  };

  const hasActiveFilters =
    localSearchValue || filters.status !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Select
            value={filters.searchType}
            onValueChange={handleSearchTypeChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">搜索服务</SelectItem>
              <SelectItem value="target">搜索目标</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                filters.searchType === "service"
                  ? "搜索服务..."
                  : "搜索目标..."
              }
              value={localSearchValue}
              onChange={(e) => handleSearchValueChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="RUNNING">运行中</SelectItem>
            <SelectItem value="SUCCESS">成功</SelectItem>
            <SelectItem value="FAILED">失败</SelectItem>
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

