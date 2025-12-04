"use client"

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function DarkLightToggle() {
  const { theme, setTheme } = useTheme();

  const toggleDarkLight = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarMenuButton
      size="default"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      onClick={toggleDarkLight}
    >
      <div className="relative flex items-center justify-center">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="text-sm">亮暗</span>
      <span className="sr-only">切换主题</span>
    </SidebarMenuButton>
  );
}

