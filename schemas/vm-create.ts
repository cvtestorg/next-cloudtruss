import { z } from "zod";

// 单台主机字段 schema (表单输入类型, 使用字符串)
export const vmHostInputSchema = z.object({
  env: z.string().min(1, "请选择隶属环境"),
  os: z.string().min(1, "请选择操作系统"),
  hostname: z.string().min(1, "请输入主机名"),
  type: z.string().min(1, "请选择类型"),
  role: z.string().min(1, "请选择角色"),
  cpu: z
    .string()
    .min(1, "请输入 CPU 核数")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 32;
      },
      { message: "CPU 必须在 1 到 32 之间" }
    ),
  memory: z
    .string()
    .min(1, "请输入内存大小")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 64;
      },
      { message: "内存必须在 1 到 64 之间" }
    ),
  disk: z
    .string()
    .min(1, "请输入磁盘大小")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 1000 && num % 100 === 0;
      },
      { message: "磁盘必须为 100 的倍数, 最大 1000 GB" }
    ),
  // 以下字段仅资源管理员可见, 普通用户不显示, 但保留在 schema 中
  cluster: z.string().optional(),
  template: z.string().optional(),
  vcluster: z.string().optional(),
  vtemplate: z.string().optional(),
  vlan: z.string().optional(),
  ipAddress: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true; // 空值允许(非必填)
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(val);
      },
      { message: "请输入有效的 IP 地址" }
    ),
  // 隐藏字段(仅资源管理员可见)
  mask: z.string().optional(),
  gateway: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true; // 空值允许(非必填)
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(val);
      },
      { message: "请输入有效的网关地址" }
    ),
  vswitch: z.string().optional(),
  vdatastore: z.string().optional(),
  vstorageprofile: z.string().optional(),
  // 文本字段
  description: z.string().optional(),
  notes: z.string().optional(),
});

// 转换后的主机 schema (用于提交)
export const vmHostSchema = vmHostInputSchema.transform((data) => ({
  ...data,
  cpu: parseInt(data.cpu, 10),
  memory: parseInt(data.memory, 10),
  disk: parseInt(data.disk, 10),
}));

// 公共字段 schema
export const vmCommonSchema = z.object({
  proxyApplicant: z.string().optional(),
  product: z.string().min(1, "请选择隶属产品"),
  expiryDate: z.date({ message: "请选择过期时间" }),
});

// 完整表单 schema (表单输入类型)
export const vmCreateFormSchema = z.object({
  common: vmCommonSchema,
  hosts: z.array(vmHostInputSchema).min(1, "至少需要添加一台主机"),
});

// 提交时的 schema (转换后的类型)
export const vmCreateSubmitSchema = z.object({
  common: vmCommonSchema,
  hosts: z.array(vmHostSchema).min(1, "至少需要添加一台主机"),
});

export type VmHostFormData = z.infer<typeof vmHostInputSchema>;
export type VmHostSubmitData = z.infer<typeof vmHostSchema>;
export type VmCommonFormData = z.infer<typeof vmCommonSchema>;
export type VmCreateFormData = z.infer<typeof vmCreateFormSchema>;
export type VmCreateSubmitData = z.infer<typeof vmCreateSubmitSchema>;
