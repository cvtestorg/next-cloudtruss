import { Skeleton } from "@/components/ui/skeleton";

interface LoadingProps {
  variant?: "default" | "table" | "minimal";
  rows?: number;
  columns?: number;
}

export function Loading({ 
  variant = "default", 
  rows = 10,
  columns = 12 
}: LoadingProps) {
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full min-w-0">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="w-full sm:w-[180px] h-10" />
                <Skeleton className="w-full sm:w-[180px] h-10" />
                <Skeleton className="w-full sm:w-[180px] h-10" />
                <Skeleton className="w-10 h-10" />
              </div>
            </div>
          </div>
          <Skeleton className="w-full sm:w-auto shrink-0 h-10" />
        </div>

        <div className="rounded-lg border w-full min-w-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="border-b">
                <div 
                  className="grid gap-4 p-4"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4" />
                  ))}
                </div>
              </div>
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="border-b p-4">
                  <div 
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: columns }).map((_, j) => (
                      <Skeleton key={j} className="h-4" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full min-w-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="flex-1 h-10" />
              <Skeleton className="w-full sm:w-[180px] h-10" />
              <Skeleton className="w-full sm:w-[180px] h-10" />
              <Skeleton className="w-full sm:w-[180px] h-10" />
              <Skeleton className="w-10 h-10" />
            </div>
          </div>
        </div>
        <Skeleton className="w-full sm:w-auto shrink-0 h-10" />
      </div>

      <div className="rounded-lg border w-full min-w-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="border-b">
              <div 
                className="grid gap-4 p-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns }).map((_, i) => (
                  <Skeleton key={i} className="h-4" />
                ))}
              </div>
            </div>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="border-b p-4">
                <div 
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: columns }).map((_, j) => (
                    <Skeleton key={j} className="h-4" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
