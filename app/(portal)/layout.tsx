import { AppSidebarLayout } from "@/layout/app-sidebar-layout";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppSidebarLayout>{children}</AppSidebarLayout>;
}
