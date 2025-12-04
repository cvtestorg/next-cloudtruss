import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

interface VmPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function VmPagination({
  currentPage,
  totalPages,
  onPageChange,
}: VmPaginationProps) {
  const [inputPage, setInputPage] = useState("");
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // 处理输入框回车事件
  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(inputPage, 10);
      
      // 边界值校验
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
        setInputPage(""); // 清空输入框
      } else {
        // 输入无效，清空并可选择性提示
        setInputPage("");
      }
    }
  };

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // 显示的页码按钮数量

    if (totalPages <= showPages + 2) {
      // 总页数较少时，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);

      // 计算当前页附近要显示的页码范围
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // 如果当前页靠近开始，多显示几个后面的页
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, showPages - 1);
      }

      // 如果当前页靠近末尾，多显示几个前面的页
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 2);
      }

      // 如果起始页不是2，显示省略号
      if (start > 2) {
        pages.push("ellipsis-start");
      }

      // 显示中间的页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 如果结束页不是倒数第二页，显示省略号
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // 总是显示最后一页
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
              style={{
                pointerEvents: canGoPrevious ? "auto" : "none",
                opacity: canGoPrevious ? 1 : 0.5,
              }}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => {
            if (typeof page === "string") {
              return (
                <PaginationItem key={`${page}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => canGoNext && onPageChange(currentPage + 1)}
              style={{
                pointerEvents: canGoNext ? "auto" : "none",
                opacity: canGoNext ? 1 : 0.5,
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          跳转到
        </span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={handlePageInput}
          placeholder={`1-${totalPages}`}
          className="w-20 h-9"
        />
        <span className="text-sm text-muted-foreground">页</span>
      </div>
    </div>
  );
}

