import type { User } from "@supabase/supabase-js";

/**
 * 获取用户的显示名称
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "用户";
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "用户"
  );
}

/**
 * 获取用户头像 URL
 */
export function getUserAvatarUrl(user: User | null): string {
  return user?.user_metadata?.avatar_url || "";
}

/**
 * 获取用户首字母（用于头像占位符）
 */
export function getUserInitials(name: string, email?: string): string {
  if (name) {
    // 处理中文名字（通常没有空格），只取第一个汉字
    if (/[\u4e00-\u9fa5]/.test(name)) {
      return name.slice(0, 1).toUpperCase();
    }
    // 处理英文名字（可能有空格），取首字母
    const firstChar = name.trim()[0];
    return firstChar ? firstChar.toUpperCase() : "U";
  }
  if (!email) return "U";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

/**
 * 从 User 对象获取用户信息
 */
export function getUserInfo(user: User | null) {
  return {
    name: getUserDisplayName(user),
    email: user?.email || "",
    avatar: getUserAvatarUrl(user),
    initials: getUserInitials(getUserDisplayName(user), user?.email),
  };
}

