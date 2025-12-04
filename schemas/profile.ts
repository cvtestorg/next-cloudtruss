import { z } from "zod"

export const profileSchema = z.object({
  fullName: z.string().min(1, "姓名不能为空").max(50, "姓名不能超过50个字符"),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("头像URL格式不正确").optional().or(z.literal("")),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

