import type { LucideIcon } from "lucide-react";
import { Shuffle, Box, Leaf, Waves, Flower, Sun, Database } from "lucide-react";

export interface TweakcnThemeConfig {
  name: string;
  value: string;
  description: string;
  cssFile: string | null;
  icon: LucideIcon;
}

export const tweakcnThemes: TweakcnThemeConfig[] = [
  {
    name: "随机主题",
    value: "default",
    description: "随机主题",
    cssFile: null,
    icon: Shuffle,
  },
  {
    name: "日落余晖",
    value: "solar-dusk",
    description: "日落余晖主题",
    cssFile: "/themes/solar-dusk.css",
    icon: Sun,
  },
  {
    name: "紫罗兰绽",
    value: "violet-bloom",
    description: "紫罗兰绽放主题",
    cssFile: "/themes/violet-bloom.css",
    icon: Flower,
  },
  {
    name: "Supabase",
    value: "supabase",
    description: "Supabase主题",
    cssFile: "/themes/supabase.css",
    icon: Database,
  },
  {
    name: "粘土形态",
    value: "claymorphism",
    description: "粘土形态主题",
    cssFile: "/themes/claymorphism.css",
    icon: Box,
  },
  {
    name: "自然翠绿",
    value: "nature",
    description: "自然主题",
    cssFile: "/themes/nature.css",
    icon: Leaf,
  },
  {
    name: "海洋微风",
    value: "ocean-breeze",
    description: "海洋微风主题",
    cssFile: "/themes/ocean-breeze.css",
    icon: Waves,
  },
  {
    name: "量子玫瑰",
    value: "quantum-rose",
    description: "量子玫瑰主题",
    cssFile: "/themes/quantum-rose.css",
    icon: Flower,
  },
  {
    name: "禅意花园",
    value: "sage-garden",
    description: "禅意花园主题",
    cssFile: "/themes/sage-garden.css",
    icon: Leaf,
  },
] as const;

export type TweakcnTheme = (typeof tweakcnThemes)[number]["value"];
