"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode, startTransition } from "react";
import { tweakcnThemes, type TweakcnTheme } from "@/config/themes";

interface ThemeContextValue {
  selectedTheme: TweakcnTheme;
  setTheme: (theme: TweakcnTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTweakcnTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTweakcnTheme must be used within TweakcnThemeProvider");
  }
  return context;
}

function getRandomNonDefaultTheme(): TweakcnTheme {
  const nonDefaultThemes = tweakcnThemes.filter((t) => t.value !== "default");
  if (nonDefaultThemes.length > 0) {
    const randomIndex = Math.floor(Math.random() * nonDefaultThemes.length);
    return nonDefaultThemes[randomIndex].value;
  }
  return "supabase";
}

function loadThemeCSS(theme: TweakcnTheme, linkRef: { current: HTMLLinkElement | null }, failedThemes: Set<string> = new Set()) {
  const existingLink = document.getElementById("tweakcn-theme-style");
  if (existingLink) {
    existingLink.remove();
    linkRef.current = null;
  }

  const themeData = tweakcnThemes.find((t) => t.value === theme);
  if (themeData?.cssFile) {
    // 如果这个主题已经失败过，跳过
    if (failedThemes.has(theme)) {
      console.warn(`Theme ${theme} has already failed, skipping`);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    // 确保路径是绝对路径，从根目录开始
    link.href = themeData.cssFile.startsWith("/") 
      ? themeData.cssFile 
      : `/${themeData.cssFile}`;
    link.id = "tweakcn-theme-style";
    link.onload = () => {
      linkRef.current = link;
    };
    link.onerror = () => {
      // 标记这个主题为失败
      failedThemes.add(theme);
      
      // 加载失败时，尝试回退到其他可用主题（排除已失败的主题）
      const availableThemes = tweakcnThemes.filter(
        (t) => t.value !== theme && t.cssFile !== null && !failedThemes.has(t.value)
      );
      
      if (availableThemes.length > 0) {
        const fallbackTheme = availableThemes[0].value;
        const fallbackThemeData = tweakcnThemes.find((t) => t.value === fallbackTheme);
        if (fallbackThemeData?.cssFile) {
          document.documentElement.setAttribute("data-theme", fallbackTheme);
          // 递归调用，传入失败主题集合
          loadThemeCSS(fallbackTheme, linkRef, failedThemes);
        } else {
          // 如果没有可用主题，移除 link 元素，使用默认样式
          linkRef.current = null;
        }
      } else {
        // 如果所有主题都失败了，停止尝试，使用默认样式
        linkRef.current = null;
      }
    };
    document.head.appendChild(link);
  } else if (theme === "default") {
    linkRef.current = null;
  }
}

export function TweakcnThemeProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedThemeState] = useState<TweakcnTheme>("supabase");
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("tweakcn-theme") as TweakcnTheme | null;

    if (savedTheme && tweakcnThemes.some((t) => t.value === savedTheme)) {
      if (savedTheme === "default") {
        const randomTheme = getRandomNonDefaultTheme();
        startTransition(() => {
          setSelectedThemeState(randomTheme);
        });
        document.documentElement.setAttribute("data-theme", randomTheme);
        loadThemeCSS(randomTheme, linkRef);
      } else {
        startTransition(() => {
          setSelectedThemeState(savedTheme);
        });
        document.documentElement.setAttribute("data-theme", savedTheme);
        loadThemeCSS(savedTheme, linkRef);
      }
    } else {
      document.documentElement.setAttribute("data-theme", "supabase");
      loadThemeCSS("supabase", linkRef);
    }
  }, []);

  const setTheme = (theme: TweakcnTheme) => {
    let themeToApply = theme;

    if (theme === "default") {
      themeToApply = getRandomNonDefaultTheme();
    }

    setSelectedThemeState(themeToApply);
    document.documentElement.setAttribute("data-theme", themeToApply);
    loadThemeCSS(themeToApply, linkRef);
    localStorage.setItem("tweakcn-theme", themeToApply);
  };

  return (
    <ThemeContext.Provider value={{ selectedTheme, setTheme }}>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem("tweakcn-theme");
                var themes = ${JSON.stringify(tweakcnThemes.map(t => t.value))};
                var themeConfig = ${JSON.stringify(
            tweakcnThemes.reduce((acc, t) => {
              acc[t.value] = t.cssFile;
              return acc;
            }, {} as Record<string, string | null>)
          )};
                
                var themeToApply = "supabase";
                
                if (savedTheme && themes.includes(savedTheme)) {
                  if (savedTheme === "default") {
                     var nonDefault = themes.filter(function(t) { return t !== "default" });
                     themeToApply = nonDefault[Math.floor(Math.random() * nonDefault.length)];
                  } else {
                     themeToApply = savedTheme;
                  }
                }
                
                document.documentElement.setAttribute("data-theme", themeToApply);
                
                var cssFile = themeConfig[themeToApply];
                if (cssFile) {
                  var link = document.createElement("link");
                  link.rel = "stylesheet";
                  // 确保路径是绝对路径
                  link.href = cssFile.startsWith("/") ? cssFile : "/" + cssFile;
                  link.id = "tweakcn-theme-style";
                  link.onerror = function() {
                    // 静默处理主题加载失败，避免控制台错误
                    // 尝试回退到其他可用主题（只尝试一次，避免循环）
                    var availableThemes = Object.keys(themeConfig).filter(function(key) {
                      return themeConfig[key] !== null && themeConfig[key] !== cssFile;
                    });
                    if (availableThemes.length > 0) {
                      var fallbackTheme = availableThemes[0];
                      var fallbackCss = themeConfig[fallbackTheme];
                      if (fallbackCss) {
                        document.documentElement.setAttribute("data-theme", fallbackTheme);
                        var fallbackLink = document.createElement("link");
                        fallbackLink.rel = "stylesheet";
                        fallbackLink.href = fallbackCss.startsWith("/") ? fallbackCss : "/" + fallbackCss;
                        fallbackLink.id = "tweakcn-theme-style";
                        fallbackLink.onerror = function() {
                          // 如果回退主题也失败，静默处理，使用默认样式
                          // 不输出错误日志，因为这是预期的回退行为
                        };
                        fallbackLink.onload = function() {
                          // 回退主题加载成功
                        };
                        document.head.appendChild(fallbackLink);
                      }
                    }
                    // 如果所有主题都失败，静默使用默认样式
                  };
                  document.head.appendChild(link);
                }
              } catch (e) {
                console.error("Theme script error:", e);
              }
            })();
          `,
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}
