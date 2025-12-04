"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { Save, User as UserIcon, Mail, Calendar, Phone } from "lucide-react";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getUserInitials, getUserDisplayName, getUserAvatarUrl } from "@/lib/user-utils";

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [saving, setSaving] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      avatarUrl: "",
    },
  })

  useEffect(() => {
    if (!user) return

    // 设置表单默认值
    form.reset({
      fullName: getUserDisplayName(user) || "",
      phone: user.user_metadata?.phone || "",
      avatarUrl: getUserAvatarUrl(user) || "",
    });
  }, [user, form])

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          name: data.fullName,
          phone: data.phone || null,
          avatar_url: data.avatarUrl || null,
        },
      })

      if (error) {
        toast.error("更新失败", {
          description: error.message,
        })
        return
      }

      toast.success("更新成功", {
        description: "您的个人信息已更新",
      })

      // useAuth hook 会自动更新用户状态，无需手动刷新
    } catch (error) {
      toast.error("更新失败", {
        description: error instanceof Error ? error.message : "未知错误",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full h-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">个人资料</h1>
            <p className="text-muted-foreground mt-2">
              管理您的个人信息和账户设置
            </p>
          </div>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 size-4" />
            {saving ? "保存中..." : "保存更改"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：头像和基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>头像</CardTitle>
              <CardDescription>更新您的头像</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="size-24">
                  <AvatarImage src={form.watch("avatarUrl") || getUserAvatarUrl(user)} />
                  <AvatarFallback className="text-3xl">
                    {getUserInitials(
                      form.watch("fullName") || getUserDisplayName(user),
                      user.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>头像URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 右侧：账户信息 */}
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
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {user.created_at && (
                  <div className="flex items-center gap-4">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">注册时间</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 个人信息表单 */}
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
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

