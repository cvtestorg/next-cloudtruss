"use client";

import { ReactNode } from "react";

// Better Auth 不需要 SessionProvider，session 通过 API 获取
// 这个组件保留是为了兼容性，但不再需要任何 provider
export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
