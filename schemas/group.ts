import * as z from "zod";

/**
 * 创建动态验证 Schema 的函数
 * 根据是否为更新模式返回不同的验证规则
 * @param isUpdateMode - 是否为更新模式
 * @returns Zod 验证 Schema
 */
export const createFormSchema = (isUpdateMode: boolean) => {
  return z.object({
    group_id: isUpdateMode
      ? z
          .string()
          .min(1, "群组 ID 不能为空")
          .min(2, "群组 ID 至少需要 2 个字符")
      : z.string().optional(),
    name: z
      .string()
      .min(1, "群名称不能为空")
      .min(2, "群名称至少需要 2 个字符")
      .max(50, "群名称不能超过 50 个字符"),
    members: z
      .string()
      .min(1, "成员列表不能为空")
      .refine(
        (val) => {
          // 验证成员列表格式：每行一个成员，去除空行
          const lines = val.split("\n").filter((line) => line.trim());
          return lines.length > 0;
        },
        { message: "请至少添加一个成员" }
      ),
    create_by: z
      .string()
      .min(1, "创建者域账号不能为空")
      .min(2, "创建者域账号至少需要 2 个字符")
      .max(50, "创建者域账号不能超过 50 个字符"),
  });
};
