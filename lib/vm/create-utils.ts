import type { VmCreateFormData } from "@/schemas/vm-create";
import type { TicketDetailResponse } from "@/types/ticket";

// 获取默认过期时间(当前日期加一年)
export function getDefaultExpiryDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
}

// 默认表单值
export function getDefaultFormValues(): VmCreateFormData {
  return {
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
}

// 将 ticket data 转换为表单格式
export function convertTicketDataToFormData(
  data: Record<string, unknown>
): VmCreateFormData {
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
    hosts:
      ticketData.hosts && ticketData.hosts.length > 0
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
        : getDefaultFormValues().hosts,
  };
}

// 从 ticket detail 获取初始表单值
export function getInitialFormValues(
  ticketId: string | null,
  ticketDetail: TicketDetailResponse | null
): VmCreateFormData {
  if (ticketId && ticketDetail?.data?.data) {
    return convertTicketDataToFormData(ticketDetail.data.data);
  }
  return getDefaultFormValues();
}
