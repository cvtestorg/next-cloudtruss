"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ErrorBoundary
          error={error}
          reset={reset}
          title="应用错误"
          description="应用发生了严重错误，请刷新页面或联系管理员"
        />
      </body>
    </html>
  );
}
