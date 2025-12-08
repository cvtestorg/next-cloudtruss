import { getServerUser } from "@/lib/auth/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getServerUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">未登录</div>
      </div>
    );
  }

  return <ProfileClient user={user} />;
}

