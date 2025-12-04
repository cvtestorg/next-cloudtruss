"use client"

import { useState, useEffect, useRef } from "react"
import { Check, Palette } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { tweakcnThemes, type TweakcnTheme } from "@/config/themes"
import { cn } from "@/lib/utils"

export function TweakcnThemeSelector() {
  // 获取随机非默认主题
  const getRandomNonDefaultTheme = (): TweakcnTheme => {
    const nonDefaultThemes = tweakcnThemes.filter((t) => t.value !== "default")
    if (nonDefaultThemes.length > 0) {
      const randomIndex = Math.floor(Math.random() * nonDefaultThemes.length)
      return nonDefaultThemes[randomIndex].value
    }
    return "violet-bloom" // 如果没有其他主题，返回紫罗兰绽
  }

  // 从 localStorage 读取保存的主题，使用初始化函数
  const [selectedTheme, setSelectedTheme] = useState<TweakcnTheme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("tweakcn-theme") as TweakcnTheme | null
      if (savedTheme && tweakcnThemes.some((t) => t.value === savedTheme)) {
        // 如果保存的是"default"，随机选择一个非默认主题
        if (savedTheme === "default") {
          return getRandomNonDefaultTheme()
        }
        return savedTheme
      }
    }
    // 初始化为紫罗兰绽主题
    return "violet-bloom"
  })
  const [open, setOpen] = useState(false)
  const linkRef = useRef<HTMLLinkElement | null>(null)

  // 动态加载 CSS 文件
  const loadThemeCSS = (theme: TweakcnTheme) => {
    // 移除之前的主题样式（通过 id 查找）
    const existingLink = document.getElementById("tweakcn-theme-style")
    if (existingLink) {
      existingLink.remove()
      linkRef.current = null
    }

    const themeData = tweakcnThemes.find((t) => t.value === theme)
    if (themeData?.cssFile) {
      // 创建新的 link 元素
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = themeData.cssFile
      link.id = "tweakcn-theme-style"
      link.onload = () => {
        linkRef.current = link
      }
      link.onerror = () => {
        console.error(`Failed to load theme CSS: ${themeData.cssFile}`)
      }
      document.head.appendChild(link)
    } else if (theme === "default") {
      // 默认主题不需要加载额外的 CSS
      linkRef.current = null
    }
  }

  // 初始化时应用主题
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme)
    loadThemeCSS(selectedTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleThemeChange = (theme: TweakcnTheme) => {
    let themeToApply = theme
    
    // 如果选择的是"默认"，随机选择一个非"默认"的主题
    if (theme === "default") {
      themeToApply = getRandomNonDefaultTheme()
    }
    
    setSelectedTheme(themeToApply)
    document.documentElement.setAttribute("data-theme", themeToApply)
    loadThemeCSS(themeToApply)
    localStorage.setItem("tweakcn-theme", themeToApply)
    setOpen(false)
  }

  const selectedThemeData = tweakcnThemes.find(
    (theme) => theme.value === selectedTheme
  )

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
            const Icon = theme.icon
            return (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value as TweakcnTheme)}
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
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

