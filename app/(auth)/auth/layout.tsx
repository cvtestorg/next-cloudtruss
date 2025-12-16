export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 认证页面不显示侧边栏，直接渲染 children
  return <>{children}</>;
}

