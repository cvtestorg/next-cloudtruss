"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorBoundary({
  error,
  reset,
  title = "加载失败",
  description,
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  const errorMessage = description || error.message || "页面加载时发生错误";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-destructive p-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold text-destructive mb-2">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <Button onClick={reset} variant="outline">
              重试
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
