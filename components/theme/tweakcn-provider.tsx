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
  return "violet-bloom";
}

function loadThemeCSS(theme: TweakcnTheme, linkRef: { current: HTMLLinkElement | null }) {
  const existingLink = document.getElementById("tweakcn-theme-style");
  if (existingLink) {
    existingLink.remove();
    linkRef.current = null;
  }

  const themeData = tweakcnThemes.find((t) => t.value === theme);
  if (themeData?.cssFile) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = themeData.cssFile;
    link.id = "tweakcn-theme-style";
    link.onload = () => {
      linkRef.current = link;
    };
    link.onerror = () => {
      console.error(`Failed to load theme CSS: ${themeData.cssFile}`);
    };
    document.head.appendChild(link);
  } else if (theme === "default") {
    linkRef.current = null;
  }
}

export function TweakcnThemeProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedThemeState] = useState<TweakcnTheme>("violet-bloom");
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
      document.documentElement.setAttribute("data-theme", "violet-bloom");
      loadThemeCSS("violet-bloom", linkRef);
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
      {children}
    </ThemeContext.Provider>
  );
}
