type User = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  accessToken?: string | null;
};

export function getUserDisplayName(user: User | null): string {
  if (!user) return "用户";
  return user.name || user.email?.split("@")[0] || "用户";
}

export function getUserAvatarUrl(user: User | null): string {
  return user?.image || "";
}

export function getUserInitials(name: string, email?: string): string {
  if (name) {
    if (/[\u4e00-\u9fa5]/.test(name)) {
      return name.slice(0, 1).toUpperCase();
    }
    const firstChar = name.trim()[0];
    return firstChar ? firstChar.toUpperCase() : "U";
  }
  if (!email) return "U";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

export function getUserInfo(user: User | null) {
  const displayName = getUserDisplayName(user);
  const email = user?.email ?? undefined;
  return {
    name: displayName,
    email: email || "",
    avatar: getUserAvatarUrl(user),
    initials: getUserInitials(displayName, email),
  };
}
