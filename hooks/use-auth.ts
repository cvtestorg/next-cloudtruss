"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  // 服务器端和客户端首次渲染时，都初始化为 loading: true, user: null
  // 这样可以确保服务器端和客户端首次渲染一致，避免 hydration 错误
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 使用 useLayoutEffect 在 DOM 更新之前快速获取 session，进一步减少闪烁
  useLayoutEffect(() => {
    // 快速获取 session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
        } else {
          // 没有 session，保持 loading 状态，等待 onAuthStateChange 触发
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let mounted = true;

    // 使用 onAuthStateChange 监听认证状态变化
    // 订阅时会立即触发一次，返回当前的 session
    // 注意：proxy.ts 已经处理了路由级别的认证检查和跳转，这里只负责状态管理
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setLoading(false);
        // 不在这里跳转，让 proxy.ts 统一处理路由保护
      } else if (session?.user) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // 使用完整页面跳转确保清除所有状态
    window.location.href = "/auth/login";
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
