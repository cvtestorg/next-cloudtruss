import { AppSidebarLayout } from "@/layout/app-sidebar-layout";

export default function WxWorkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppSidebarLayout>{children}</AppSidebarLayout>;
}
