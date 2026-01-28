import type { Pagination } from "./pagination";

// 虚拟机对象
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
  product: string;
  product_line: string;
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
  is_recycle: boolean;
  create_at: string;
  expire_date: string;
  sync_time: string;
}

export interface VirtualMachineList extends Pagination {
  items: VirtualMachineItem[];
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

// 虚拟机状态枚举数据
export interface VirtualMachineStatus {
  value: string;
  label: string;
}

export interface VirtualMachineStatusResponse {
  success: boolean;
  code: number;
  message: string;
  data: VirtualMachineStatus[];
}

// 虚拟磁盘
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

// 虚拟网卡
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

// 云链接配置
export interface VcenterItem {
  id: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sync_time: string;
  sync_crontab: string;
  sync_status: string;
  sync_error_message: string;
  name: string;
  address: string;
  token: string;
  type: string;
}

export interface VcenterReponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VcenterItem[];
}

// 数据中心
export interface VDataCenter {
  id: string;
  vdatacenter_id: string;
  name: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcenter: string;
  resource_type: string;
}

// 数据中心响应
export interface VDataCenterResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VDataCenter[];
}

// 隶属集群
export interface VClusterItem {
  id: string;
  vcluster_id: string;
  name: string;
  is_flash: boolean;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vdatacenter: string;
  vcenter: string;
  resource_type: string;
}

export interface VClusterResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VClusterItem[];
}

/* 操作系统 */
export interface OSItem {
  name: string;
  software: string;
}

export interface OSResponse {
  success: boolean;
  code: number;
  message: string;
  data: OSItem[];
}

// 虚拟机资源池
export interface VResourcePoolItem {
  id: string;
  vresource_id: string;
  name: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcluster: string;
  vcenter: string;
  resource_type: string;
}

export interface VResourcePoolResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VResourcePoolItem[];
}

// 虚拟机模板
export interface VTemplateItem {
  id: string;
  vtemplate_id: string;
  name: string;
  os: string;
  software: string | null;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcenter: string;
  resource_type: string;
}

export interface VTemplateResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VTemplateItem[];
}

// VLAN
export interface VLanItem {
  id: string;
  vlan_id: string;
  name: string;
  vswitch_id: string;
  vlan: string;
  subnet: string;
  gateway: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcluster: string;
}

export interface VLanResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VLanItem[];
}

// VSwitch
export interface VSwitchItem {
  id: string;
  vlan_id: string;
  name: string;
  vswitch_id: string;
  vlan: string;
  subnet: string;
  gateway: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcluster: string;
}

export interface VSwitchResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VSwitchItem[];
}

// 虚拟存储池
export interface VStorageItem {
  id: string;
  vstorage_id: string;
  name: string;
  type: string;
  path: string;
  size: number;
  status: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcluster: string;
  vcenter: string;
  resource_type: string;
}

export interface VStorageResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VStorageItem[];
}

// 虚拟存储池策略
export interface VStorageProfileItem {
  id: string;
  vprofile_id: string;
  name: string;
  extra: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_time: string;
  vcluster: string;
  vcenter: string;
  resource_type: string;
}

export interface VStorageProfileResponse {
  pages: number;
  size: number;
  page: number;
  total: number;
  items: VStorageProfileItem[];
}
