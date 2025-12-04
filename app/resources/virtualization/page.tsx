"use client"
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { getVirtualMachinesAction } from "@/actions/vm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./components/StatusBadge";
import { PowerStatusBadge } from "./components/PowerStatusBadge";
import { VmPagination } from "./components/VmPagination";
import {
  VmSearchFilter,
  type FilterParams,
} from "./components/VmSearchFilter";
import { VmContextMenu } from "./components/VmContextMenu";
import type { VirtualMachineItem, VirtualMachineList } from "@/types/vm";

export default function VirtualMachineList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filters, setFilters] = useState<FilterParams>({
    search: "",
    status: "all",
    powerStatus: "all",
    env: "all",
  });

  const [data, setData] = useState<VirtualMachineList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      setError(null);
      try {
        // 使用 Server Action 调用服务器端 API
        const result = await getVirtualMachinesAction(page, pageSize);
        setData(result);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("未知错误"));
        setIsLoading(false);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [page, pageSize]);

  // 前端过滤逻辑
  const filteredData = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((vm: VirtualMachineItem) => {
      // 搜索过滤：名称、主机名、地址
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          vm.name.toLowerCase().includes(searchLower) ||
          vm.hostname.toLowerCase().includes(searchLower) ||
          vm.address.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 状态过滤
      if (filters.status !== "all") {
        if (vm.status.toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }
      }

      // 电源状态过滤
      if (filters.powerStatus !== "all") {
        const powerStatusLower = vm.power_status.toLowerCase();
        if (filters.powerStatus === "on") {
          if (powerStatusLower !== "on" && powerStatusLower !== "poweredon") {
            return false;
          }
        } else if (filters.powerStatus === "off") {
          if (powerStatusLower !== "off" && powerStatusLower !== "poweredoff") {
            return false;
          }
        }
      }

      // 环境过滤
      if (filters.env !== "all") {
        if (vm.env.toLowerCase() !== filters.env.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [data?.items, filters]);

  // 处理过滤条件变化
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1); // 重置到第一页
  };

  // 重置过滤条件
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      powerStatus: "all",
      env: "all",
    });
    setPage(1);
  };

  // 处理右键菜单操作
  const handleVmAction = (action: string, vm: VirtualMachineItem) => {
    console.log(`执行操作: ${action}`, vm);
    // TODO: 根据不同的 action 执行对应的操作
  };

  // 处理申请虚拟机
  const handleCreateVm = () => {
    router.push("/resources/virtualization/create");
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          加载失败: {error instanceof Error ? error.message : "未知错误"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full min-w-0">
      <VmSearchFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />
        </div>
        <Button onClick={handleCreateVm} className="w-full sm:w-auto shrink-0">
          <PlusCircle className="h-4 w-4" />
          申请虚拟机
        </Button>
      </div>

      <div className="rounded-lg border relative w-full min-w-0 overflow-hidden">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        )}
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>主机名</TableHead>
              <TableHead>地址</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>内存</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>电源状态</TableHead>
              <TableHead>所有者</TableHead>
              <TableHead>应用</TableHead>
              <TableHead>环境</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>vCenter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center">
                  初次加载中...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center">
                  {filters.search ||
                  filters.status !== "all" ||
                  filters.powerStatus !== "all" ||
                  filters.env !== "all"
                    ? "没有符合条件的数据"
                    : "暂无数据"}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((vm) => (
                <TableRow key={vm.id}>
                  <TableCell>
                    <VmContextMenu vm={vm} onAction={handleVmAction}>
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => router.push(`/resources/virtualization/${vm.id}`)}
                      >
                        {vm.name}
                      </div>
                    </VmContextMenu>
                  </TableCell>
                  <TableCell>{vm.hostname}</TableCell>
                  <TableCell>{vm.address}</TableCell>
                  <TableCell>{vm.cpu}</TableCell>
                  <TableCell>{vm.memory} GB</TableCell>
                  <TableCell>
                    <StatusBadge status={vm.status} />
                  </TableCell>
                  <TableCell>
                    <PowerStatusBadge powerStatus={vm.power_status} />
                  </TableCell>
                  <TableCell>{vm.owner}</TableCell>
                  <TableCell>{vm.application}</TableCell>
                  <TableCell>{vm.env}</TableCell>
                  <TableCell>{vm.role}</TableCell>
                  <TableCell>{vm.vcenter}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {data && data.pages > 1 && (
        <VmPagination
          currentPage={page}
          totalPages={data.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

