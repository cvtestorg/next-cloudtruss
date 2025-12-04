import type { Pagination } from "./pagination";

export interface VirtualMachineItem {
  id: string;
  uuid: string;
  name: string;
  hostname: string;
  address: string;
  cpu: number;
  memory: number;
  status: string;
  power_status: string;
  owner: string;
  application: string;
  env: string;
  role: string;
  iam: boolean;
  description: string;
  is_archive: boolean;
  vcluster: string;
  is_flash: boolean;
  vcenter: string;
  resource_type: string;
}

export interface VirtualMachineList extends Pagination {
  items: VirtualMachineItem[];
}

export interface VirtualDisk {
  extra: string | null;
  created_at: string;
  updated_at: string;
  sync_time: string;
  is_deleted: boolean;
  id: string;
  vdisk_id: string;
  name: string;
  key: string;
  size: number;
  status: string;
  is_sys: boolean;
  mount_point: string;
  exists_snapshot: boolean;
}

export interface VirtualNetwork {
  extra: string | null;
  created_at: string;
  updated_at: string;
  sync_time: string;
  is_deleted: boolean;
  id: string;
  vnic_id: string;
  name: string;
  is_primary: boolean;
  key: string;
  ip: string;
  mac: string;
  status: string;
}

export interface VirtualMachineDetail {
  success: boolean;
  code: number;
  message: string;
  data: {
    disk: VirtualDisk[];
    network: VirtualNetwork[];
  } & VirtualMachineItem;
}
