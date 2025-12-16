"use client";

import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getUserInitials } from "@/lib/user-utils";
import type { UserInfo } from "@/types/user";
import type { ProfileFormValues } from "@/schemas/profile";

export function ProfileAvatarCard({ userInfo }: { userInfo: UserInfo }) {
  const form = useFormContext<ProfileFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>头像</CardTitle>
        <CardDescription>更新您的头像</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="size-24">
            <AvatarImage
              src={form.watch("avatarUrl") || userInfo.avatar || undefined}
            />
            <AvatarFallback className="text-3xl">
              {getUserInitials(
                form.watch("fullName") || userInfo.real_name || "",
                userInfo.email
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
  );
}
