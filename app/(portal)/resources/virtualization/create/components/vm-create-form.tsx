"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { VmCommonFields } from "./vm-common-fields";
import { VmHostFormFields } from "./vm-host-form-fields";
import {
  vmCreateFormSchema,
  type VmCreateFormData,
} from "@/schemas/vm-create";
import { createTicketAction, updateTicketAction } from "@/actions/ticket";
import type { TicketDetailResponse } from "@/types/ticket";

interface VmCreateFormProps {
  initialValues: VmCreateFormData;
  ticketId?: string;
  ticketDetail?: TicketDetailResponse | null;
}

export function VmCreateForm({
  initialValues,
  ticketId,
  ticketDetail,
}: VmCreateFormProps) {
  const router = useRouter();
  const form = useForm<VmCreateFormData>({
    resolver: zodResolver(vmCreateFormSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;
  const formData = form.watch();

  const onSubmit = async (data: VmCreateFormData) => {
    if (isSubmitting) return;

    try {
      // 转换表单数据为提交格式
      const submitData = {
        common: data.common,
        hosts: data.hosts.map((host) => ({
          ...host,
          cpu: parseInt(host.cpu, 10),
          memory: parseInt(host.memory, 10),
          disk: parseInt(host.disk, 10),
        })),
      };

      // 根据是否有 ticketId 决定调用创建还是更新
      if (ticketId) {
        // 更新工单，status 从详情中获取
        const ticketStatus = ticketDetail?.data?.data?.status;
        const currentStatus = (ticketStatus || "pending") as string;

        await updateTicketAction(ticketId, {
          data: submitData,
          status: currentStatus,
        });

        toast.success("更新申请成功", {
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      } else {
        // 创建工单
        const hostCount = data.hosts.length;
        const title = `申请虚拟机 (${hostCount}) 台)`;

        await createTicketAction({
          title,
          data: submitData,
        });

        toast.success("提交申请成功", {
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
        router.push("/approval/list");
      }
    } catch (error) {
      console.error(ticketId ? "更新失败:" : "提交失败:", error);
      toast.error(ticketId ? "更新申请失败" : "提交申请失败", {
        description: error instanceof Error ? error.message : "未知错误",
        icon: <XCircle className="h-4 w-4" />,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.push("/resources/virtualization")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">
                {ticketId ? "更新虚拟机申请单" : "创建虚拟机申请单"}
              </h1>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] max-h-[500px] overflow-auto">
                  <h3 className="text-lg font-semibold mb-4">表单数据预览</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? ticketId ? "更新中..." : "提交中..."
                  : ticketId ? "更新申请" : "提交申请"}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent>
              <VmCommonFields />
            </CardContent>
          </Card>

          <VmHostFormFields />
          <FormField
            control={form.control}
            name="hosts"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
