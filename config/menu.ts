import type { LucideIcon } from "lucide-react";
import { Home, Box, MessageCircleCode } from "lucide-react";

export interface MenuSubItem {
  title: string;
  href: string;
}

export interface MenuItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  subItems?: MenuSubItem[];
  defaultOpen?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    title: "首页",
    href: "/",
    icon: Home,
  },
  {
    title: "服务目录",
    icon: Box,
    defaultOpen: true,
    subItems: [{ title: "1. 虚拟机管理", href: "/resources/virtualization" }],
  },
  {
    title: "企业微信",
    icon: MessageCircleCode,
    defaultOpen: true,
    subItems: [{ title: "1. 企微建群", href: "/wxwork/group" }],
  },
];
