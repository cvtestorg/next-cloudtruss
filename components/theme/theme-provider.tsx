"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { siteConfig } from "@/config/site"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={siteConfig.theme.defaultTheme}
      enableSystem={siteConfig.theme.enableSystem}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

