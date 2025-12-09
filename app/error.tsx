"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="页面加载失败"
      description="页面加载时发生错误，请重试或联系管理员"
    />
  );
}
