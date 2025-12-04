"use client";

import { usePathname } from "next/navigation";
import { isAuthPage } from "@/lib/auth-utils";
import { RootLayoutClientWrapper } from "./root";

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 认证页面不显示侧边栏
  if (isAuthPage(pathname)) {
    return <>{children}</>;
  }

  // 其他页面显示侧边栏
  return <RootLayoutClientWrapper>{children}</RootLayoutClientWrapper>;
}

