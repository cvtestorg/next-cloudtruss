import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getProjects } from "@/services/project";
import type { ProjectListResponse } from "@/types/project";

interface ProjectSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProjectSelect({
  value,
  onChange,
  placeholder = "请选择项目",
  disabled,
  className,
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // 搜索防抖处理
  useEffect(() => {
    if (open) {
      // 如果搜索关键词为空，立即更新防抖搜索
      if (search === "") {
        setDebouncedSearch("");
        setCurrentPage(1);
        return;
      }
      
      // 有搜索关键词时，防抖处理（500ms）
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
        setCurrentPage(1); // 搜索时重置到第一页
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [search, open]);

  // 获取项目列表（只有在下拉框打开时才发起请求）
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setIsFetching(true);
      const isFirstLoad = !data;
      if (isFirstLoad) {
        setIsLoading(true);
      }
      try {
        const result = await getProjects({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch,
    depth: 1, // depth=1 获取产品列表
        });
        setData(result);
        setIsLoading(false);
      } catch (error) {
        console.error("获取项目列表失败:", error);
        setIsLoading(false);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentPage, debouncedSearch]);

  const projects = data?.success && data.data ? data.data.items || [] : [];
  const totalPages = data?.success && data.data ? data.data.total_pages || 1 : 1;
  const total = data?.success && data.data ? data.data.total || 0 : 0;
  // 只在首次加载时显示 loading，翻页时保持显示旧数据
  const showLoading = isLoading && !data;

  // 切换页码
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const selectedProject = projects.find((project) => project.code === value);

  // 关闭下拉框时重置搜索状态和分页
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setDebouncedSearch("");
      setCurrentPage(1);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
          disabled={disabled}
        >
          {selectedProject
            ? selectedProject.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="搜索项目..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {showLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>未找到项目</CommandEmpty>
                <CommandGroup>
                  {projects.length === 0 && !isFetching ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      暂无数据
                    </div>
                  ) : (
                    projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={`${project.name} ${project.code}`}
                      onSelect={() => {
                        onChange(project.code);
                        setOpen(false);
                        setSearch("");
                        setDebouncedSearch("");
                        setCurrentPage(1);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === project.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{project.name}</span>
                        {project.code && (
                          <span className="text-xs text-muted-foreground">
                            {project.code}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                    ))
                  )}
                </CommandGroup>
                {/* 后台加载指示器 */}
                {isFetching && projects.length > 0 && (
                  <div className="flex items-center justify-center py-2 border-t">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
        {/* 分页控件 */}
        {!showLoading && total > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <div className="text-xs text-muted-foreground">
              共 {total} 条，第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePageChange(currentPage - 1);
                }}
                disabled={currentPage <= 1 || totalPages <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePageChange(currentPage + 1);
                }}
                disabled={currentPage >= totalPages || totalPages <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}


