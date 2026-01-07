"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
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
import { getVirtualMachineStatusAction } from "@/actions/vm";
import type { VirtualMachineStatus } from "@/types/vm";

export interface FilterParams {
  like_name: string;
  like_env: string;
  vcenter: string;
  status: string;
}

export function VmSearchFilterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<FilterParams>(
    () => ({
      like_name: searchParams.get("like_name") || "",
      like_env: searchParams.get("like_env") || "all",
      vcenter: searchParams.get("vcenter") || "all",
      status: searchParams.get("status") || "all",
    }),
    [searchParams]
  );

  // 本地搜索输入值，用于防抖
  const [localSearchValue, setLocalSearchValue] = useState(filters.like_name);

  // 获取状态列表
  const [statusOptions, setStatusOptions] = useState<VirtualMachineStatus[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const response = await getVirtualMachineStatusAction();
        if (response.success && response.data) {
          setStatusOptions(response.data);
        }
      } catch (error) {
        console.error("获取状态列表失败:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchStatus();
  }, []);

  // 当 URL 参数变化时，同步本地值（例如重置或外部更新）
  useEffect(() => {
    setLocalSearchValue(filters.like_name);
  }, [filters.like_name]);

  // 防抖处理：停止输入 500ms 后再更新 URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchValue !== filters.like_name) {
        const params = new URLSearchParams(searchParams.toString());
        
        if (localSearchValue && localSearchValue.trim()) {
          params.set("like_name", localSearchValue);
        } else {
          params.delete("like_name");
        }
        
        params.set("page", "1");
        router.push(`?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchValue, filters.like_name, router, searchParams]);

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
    setLocalSearchValue(value);
  };

  const handleEnvChange = (value: string) => {
    updateFilters({ like_env: value });
  };

  const handleVcenterChange = (value: string) => {
    updateFilters({ vcenter: value });
  };

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value });
  };

  const handleReset = () => {
    router.push("/resources/virtualization");
  };

  const hasActiveFilters =
    filters.like_name ||
    filters.like_env !== "all" ||
    filters.vcenter !== "all" ||
    filters.status !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索名称、主机名或地址..."
            value={localSearchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filters.like_env} onValueChange={handleEnvChange}>
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

        <Select value={filters.vcenter} onValueChange={handleVcenterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="vCenter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部 vCenter</SelectItem>
            <SelectItem value="VCSA-ZSC">VCSA-ZSC</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={handleStatusChange}
          disabled={isLoadingStatus}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={isLoadingStatus ? "加载中..." : "状态"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
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
