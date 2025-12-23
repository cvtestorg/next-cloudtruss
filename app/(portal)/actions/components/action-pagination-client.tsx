"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
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

interface ActionPaginationClientProps {
  currentPage: number;
  totalPages: number;
}

export function ActionPaginationClient({
  currentPage,
  totalPages,
}: ActionPaginationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState("");

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(inputPage, 10);

      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        handlePageChange(page);
        setInputPage("");
      } else {
        setInputPage("");
      }
    }
  };

  const pageNumbers = useMemo(() => {
    if (!totalPages) return [];
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, showPages - 1);
      }

      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 2);
      }

      if (start > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => canGoPrevious && handlePageChange(currentPage - 1)}
              style={{
                pointerEvents: canGoPrevious ? "auto" : "none",
                opacity: canGoPrevious ? 1 : 0.5,
              }}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) => {
            if (typeof pageNum === "string") {
              return (
                <PaginationItem key={`${pageNum}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => canGoNext && handlePageChange(currentPage + 1)}
              style={{
                pointerEvents: canGoNext ? "auto" : "none",
                opacity: canGoNext ? 1 : 0.5,
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">跳转到</span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={handlePageInput}
          className="w-16 h-8 text-center"
          placeholder="页码"
        />
        <span className="text-sm text-muted-foreground">页</span>
      </div>
    </div>
  );
}

