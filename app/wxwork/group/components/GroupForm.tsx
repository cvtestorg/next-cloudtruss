"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Users, User, Hash, MessageSquare } from "lucide-react";
import { InvalidUserIds } from "./InvalidUserIds";

/**
 * 群组表单组件的属性
 */
interface GroupFormProps {
  /** React Hook Form 实例 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  /** 是否正在提交 */
  isSubmitting: boolean;
  /** 是否为更新模式 */
  isUpdateMode: boolean;
  /** 无效用户 ID 列表 */
  invalidUserIds: string[];
  /** 表单提交回调 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  /** 模式切换回调 */
  onModeChange: (isUpdateMode: boolean) => void;
}

/**
 * 群组表单组件
 * 用于创建或更新企业微信群组
 */
export function GroupForm({
  form,
  isSubmitting,
  isUpdateMode,
  invalidUserIds,
  onSubmit,
  onModeChange,
}: GroupFormProps) {
  // 记录当前聚焦的表单字段
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <Card className="flex flex-col h-full overflow-hidden gap-0">
      <CardHeader className="shrink-0 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {isUpdateMode ? "更新群组" : "创建群组"}
            </CardTitle>
          </div>
          {/* 模式切换开关 */}
          <div className="flex items-center gap-2">
            <Label htmlFor="mode-switch" className="text-sm cursor-pointer">
              {isUpdateMode ? "更新模式" : "创建模式"}
            </Label>
            <Switch
              id="mode-switch"
              checked={isUpdateMode}
              onCheckedChange={onModeChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-6" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* 表单滚动区域 */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 群组 ID - 仅在更新模式下显示 */}
            {isUpdateMode && (
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="size-4" />
                      群组 ID <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入要更新的群组 ID"
                        {...field}
                        disabled={isSubmitting}
                        onFocus={() => setFocusedField("group_id")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormControl>
                    {focusedField === "group_id" && (
                      <FormDescription>输入需要更新的群组 ID</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 群名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    群名称 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：技术交流群"
                      {...field}
                      disabled={isSubmitting}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>
                  {focusedField === "name" && (
                    <FormDescription>
                      输入一个有意义的群组名称，2-50 个字符
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 成员列表 */}
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="size-4" />
                    成员列表 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`每行一个域账号，例如：\npeizhenfei\njianjiajun\nzhengmingzai`}
                      className="min-h-32 font-mono text-sm"
                      {...field}
                      disabled={isSubmitting}
                      onFocus={() => setFocusedField("members")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>
                  {focusedField === "members" && (
                    <FormDescription>
                      每行输入一个成员域账号，至少添加一个成员
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 创建者域账号 */}
            <FormField
              control={form.control}
              name="create_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="size-4" />
                    创建者域账号 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="例如：zhangsan"
                      {...field}
                      disabled={isSubmitting}
                      onFocus={() => setFocusedField("create_by")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>
                  {focusedField === "create_by" && (
                    <FormDescription>
                      输入群组创建者的域账号（用户名）
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {isUpdateMode ? "更新中..." : "创建中..."}
                  </>
                ) : (
                  <>
                    <Users />
                    {isUpdateMode ? "更新群组" : "创建群组"}
                  </>
                )}
              </Button>

              {/* 清空表单按钮 */}
              {!isSubmitting && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  清空
                </Button>
              )}
            </div>
          </form>
        </Form>
        </div>
        
        {/* 无效用户 ID 展示区域 - 固定在底部 */}
        {invalidUserIds.length > 0 && (
          <div className="shrink-0 border-t pt-4">
            <InvalidUserIds invalidUserIds={invalidUserIds} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

