"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VmCommonFields } from "./components/VmCommonFields";
import { VmHostFormFields } from "./components/VmHostFormFields";
import {
  vmCreateFormSchema,
  type VmCreateFormData,
} from "./schemas/vm-create-schema";
import { getTicketDetail, createTicket, updateTicket } from "@/services/ticket";
import type { TicketDetailResponse } from "@/types/ticket";

// 获取默认过期时间（当前日期加一年）
const getDefaultExpiryDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
};

// 默认表单值
const defaultFormValues: VmCreateFormData = {
  common: {
    proxyApplicant: "",
    product: "",
    expiryDate: getDefaultExpiryDate(),
  },
  hosts: [
    {
      env: "prod",
      os: "ubuntu24",
      hostname: "",
      type: "hybrid",
      role: "generic",
      cpu: "",
      memory: "",
      disk: "",
      cluster: "",
      template: "",
      vlan: "",
      ipAddress: "",
      mask: "",
      gateway: "",
      vswitch: "",
      vdatastore: "",
      description: "",
      notes: "",
    },
  ],
};

// 将 ticket data 转换为表单格式
function convertTicketDataToFormData(data: Record<string, unknown>): VmCreateFormData {
  const ticketData = data as {
    common?: {
      proxyApplicant?: string;
      product?: string;
      expiryDate?: string;
    };
    hosts?: Array<{
      env?: string;
      os?: string;
      hostname?: string;
      type?: string;
      role?: string;
      cpu?: number;
      memory?: number;
      disk?: number;
      cluster?: string;
      template?: string;
      vlan?: string;
      ipAddress?: string;
      mask?: string;
      gateway?: string;
      vswitch?: string;
      vdatastore?: string;
      description?: string;
      notes?: string;
    }>;
  };

  return {
    common: {
      proxyApplicant: ticketData.common?.proxyApplicant || "",
      product: ticketData.common?.product || "",
      expiryDate: ticketData.common?.expiryDate
        ? new Date(ticketData.common.expiryDate)
        : getDefaultExpiryDate(),
    },
    hosts: ticketData.hosts && ticketData.hosts.length > 0
      ? ticketData.hosts.map((host) => ({
          env: host.env || "prod",
          os: host.os || "ubuntu24",
          hostname: host.hostname || "",
          type: host.type || "hybrid",
          role: host.role || "generic",
          cpu: host.cpu?.toString() || "",
          memory: host.memory?.toString() || "",
          disk: host.disk?.toString() || "",
          cluster: host.cluster || "",
          template: host.template || "",
          vlan: host.vlan || "",
          ipAddress: host.ipAddress || "",
          mask: host.mask || "",
          gateway: host.gateway || "",
          vswitch: host.vswitch || "",
          vdatastore: host.vdatastore || "",
          description: host.description || "",
          notes: host.notes || "",
        }))
      : defaultFormValues.hosts,
  };
}

function VirtualMachineCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");

  const [ticketDetail, setTicketDetail] = useState<TicketDetailResponse | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取工单详情
  useEffect(() => {
    if (!ticketId) {
      setTicketDetail(null);
      return;
    }

    const fetchTicketDetail = async () => {
      setIsLoadingTicket(true);
      try {
        const result = await getTicketDetail(ticketId);
        setTicketDetail(result);
      } catch (error) {
        console.error("获取工单详情失败:", error);
        toast.error("获取工单详情失败", {
          description: error instanceof Error ? error.message : "未知错误",
        });
      } finally {
        setIsLoadingTicket(false);
      }
    };

    fetchTicketDetail();
  }, [ticketId]);

  // 根据是否有 ticketId 决定使用默认值还是从 API 获取的数据
  const initialValues = useMemo(() => {
    if (ticketId && ticketDetail?.data?.data) {
      return convertTicketDataToFormData(ticketDetail.data.data);
    }
    return defaultFormValues;
  }, [ticketId, ticketDetail]);

  const form = useForm<VmCreateFormData>({
    resolver: zodResolver(vmCreateFormSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // 当 ticket 数据加载完成后，更新表单值
  useEffect(() => {
    if (ticketId && ticketDetail?.data?.data && !isLoadingTicket) {
      const formData = convertTicketDataToFormData(ticketDetail.data.data);
      form.reset(formData);
    }
  }, [ticketId, ticketDetail, isLoadingTicket, form]);

  // 实时监听表单数据变化
  const formData = form.watch();

  const onSubmit = async (data: VmCreateFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
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

        await updateTicket(ticketId, {
          data: submitData,
          status: currentStatus,
        });

        toast.success("更新申请成功", {
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
        // router.push("/resources/virtualization");
      } else {
        // 创建工单
        const hostCount = data.hosts.length;
        const title = `申请虚拟机 (${hostCount}) 台)`;
        
        await createTicket({
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
    } finally {
      setIsSubmitting(false);
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
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isSubmitting}
              >
                {isSubmitting
                  ? (ticketId ? "更新中..." : "提交中...")
                  : (ticketId ? "更新申请" : "提交申请")}
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

export default function VirtualMachineCreate() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <VirtualMachineCreateContent />
    </Suspense>
  );
}

