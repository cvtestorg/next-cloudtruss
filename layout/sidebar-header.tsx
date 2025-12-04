import { LayoutGrid } from "lucide-react";
import { siteConfig } from "@/config/site";

export function SidebarHeader() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      <div className="flex items-center gap-2">
        <LayoutGrid className="size-5 text-primary" />
        <span className="font-semibold text-lg">{siteConfig.name}</span>
      </div>
      <p className="text-xs text-muted-foreground px-7 line-clamp-2">
        {siteConfig.description}
      </p>
    </div>
  );
}

