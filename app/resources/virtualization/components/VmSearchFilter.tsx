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

interface VmSearchFilterProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onReset: () => void;
}

export function VmSearchFilter({
  filters,
  onFilterChange,
  onReset,
}: VmSearchFilterProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handlePowerStatusChange = (value: string) => {
    onFilterChange({ ...filters, powerStatus: value });
  };

  const handleEnvChange = (value: string) => {
    onFilterChange({ ...filters, env: value });
  };

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

        <Button variant="outline" size="icon" onClick={onReset}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

