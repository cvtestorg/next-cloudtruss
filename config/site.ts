export const siteConfig = {
  name: "CloudTruss",
  title: "CloudTruss",
  icon: "/favicon.ico",
  description: "基础架构服务目录",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/logo.png",
  links: {
    docs: "https://docs.example.com",
  },
  locale: "zh-CN",
  theme: {
    defaultTheme: "system" as "light" | "dark" | "system",
    enableSystem: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
