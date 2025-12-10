"use client";

import { useEffect, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, User as UserIcon, Phone, Mail, Calendar } from "lucide-react";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile";
import { toast } from "sonner";
import { updateCurrentUserAction } from "@/actions/user";
import type { UserInfo } from "@/types/user";
import { useRouter } from "next/navigation";
import { ProfileAvatarCard } from "./components/ProfileAvatarCard";

export function ProfileClient({ userInfo }: { userInfo: UserInfo }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (!userInfo) return;

    form.reset({
      fullName: userInfo.real_name || "",
      phone: userInfo.phone || "",
      avatarUrl: userInfo.avatar || "",
    });
  }, [userInfo, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    startTransition(async () => {
      try {
        await updateCurrentUserAction({
          real_name: data.fullName,
          phone: data.phone || undefined,
          avatar: data.avatarUrl || undefined,
        });

        toast.success("更新成功", {
          description: "您的个人信息已更新",
        });

        router.refresh();
      } catch (error) {
        toast.error("更新失败", {
          description: error instanceof Error ? error.message : "未知错误",
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileAvatarCard userInfo={userInfo} />
            <Card>
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
                <CardDescription>查看您的账户详情</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Mail className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">邮箱地址</p>
                      <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                    </div>
                  </div>

                  {userInfo.created_at && (
                    <div className="flex items-center gap-4">
                      <Calendar className="size-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">注册时间</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(userInfo.created_at).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>更新您的个人信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-9"
                              placeholder="请输入您的姓名"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>手机号码</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-9"
                              type="tel"
                              placeholder="请输入11位手机号码"
                              maxLength={11}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    <Save className="mr-2 size-4" />
                    {isPending ? "保存中..." : "保存更改"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}
