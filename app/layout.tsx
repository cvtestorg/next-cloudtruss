import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TweakcnThemeProvider } from "@/components/theme/tweakcn-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/lib/auth";


export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [],
  authors: [
    {
      name: siteConfig.name,
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在 Server Component 中获取 session
  const session = await auth();

  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider session={session}>
          <ThemeProvider>
            <TweakcnThemeProvider>
              {children}
              <Toaster />
            </TweakcnThemeProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
