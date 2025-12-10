import { getCurrentUserAction } from "@/actions/user";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  let userInfo;
  try {
    const response = await getCurrentUserAction();
    userInfo = response.data;
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">获取用户信息失败</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">未登录</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">个人资料</h1>
          <p className="text-muted-foreground mt-2">
            管理您的个人信息和账户设置
          </p>
        </div>
      </div>

      <ProfileClient userInfo={userInfo} />
    </div>
  );
}

