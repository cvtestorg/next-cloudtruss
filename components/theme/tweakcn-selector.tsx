"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { tweakcnThemes, type TweakcnTheme } from "@/config/themes";
import { cn } from "@/lib/utils";
import { useTweakcnTheme } from "./tweakcn-provider";

export function TweakcnThemeSelector() {
  const { selectedTheme, setTheme } = useTweakcnTheme();
  const [open, setOpen] = useState(false);

  const selectedThemeData = tweakcnThemes.find(
    (theme) => theme.value === selectedTheme
  );

  const handleThemeChange = (theme: TweakcnTheme) => {
    setTheme(theme);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          size="default"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Palette className="size-4" />
          <span className="truncate text-sm">
            {selectedThemeData?.name || "主题"}
          </span>
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-36 p-2"
        align="end"
        side="right"
        sideOffset={4}
      >
        <div className="space-y-1">
          {tweakcnThemes.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  selectedTheme === theme.value && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-left">{theme.name}</span>
                <Check
                  className={cn(
                    "size-4",
                    selectedTheme === theme.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
