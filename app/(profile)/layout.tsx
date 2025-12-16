import { AppSidebarLayout } from "@/layout/app-sidebar-layout";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppSidebarLayout>{children}</AppSidebarLayout>;
}
