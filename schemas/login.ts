import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "请输入有效的邮箱地址" }),
  password: z.string().min(6, { error: "密码至少需要6个字符" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
