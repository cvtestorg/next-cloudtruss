"use client";

import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Trash2, Copy, GripVertical, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVcenterListAction, getVDataCenterListAction, getOSListAction, getVClusterListAction, getVTemplateListAction, getVSwitchListAction, getVStorageListAction, getVStorageProfileListAction } from "@/actions/vm";
import type { VcenterItem, VDataCenter, OSItem, VClusterItem, VTemplateItem, VSwitchItem, VStorageItem, VStorageProfileItem } from "@/types/vm";
import type { VmCreateFormData } from "@/schemas/vm-create";

export function VmHostFormFields() {
  const { control, setValue, getValues } = useFormContext<VmCreateFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "hosts",
  });

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动 8px 后才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };
  
  // 记录正在执行动画的主机索引和字段可见性
  const [animatingHosts, setAnimatingHosts] = useState<Record<number, Set<string>>>({});
  // 记录卡片的显示/隐藏状态（用于删除动画）
  const [cardVisibility, setCardVisibility] = useState<Record<number, boolean>>({});
  // 记录新添加的卡片（用于高亮动画）
  const [highlightedCards, setHighlightedCards] = useState<Set<number>>(new Set());
  // 记录边框正在渐隐的卡片（用于边框渐隐动画）
  const [fadingBorderCards, setFadingBorderCards] = useState<Set<number>>(new Set());
  // 记录正在删除的卡片（用于删除动画）
  const [deletingCards, setDeletingCards] = useState<Set<number>>(new Set());
  
  // vcenter 列表数据
  const [vcenterList, setVcenterList] = useState<VcenterItem[]>([]);
  const [isLoadingVcenter, setIsLoadingVcenter] = useState(false);
  const [vcenterError, setVcenterError] = useState<string | null>(null);

  // vdatacenter 列表数据（每个主机独立）
  const [vdatacenterList, setVdatacenterList] = useState<Record<number, VDataCenter[]>>({});
  const [isLoadingVdatacenter, setIsLoadingVdatacenter] = useState<Record<number, boolean>>({});
  const [vdatacenterError, setVdatacenterError] = useState<Record<number, string | null>>({});

  // vcluster 列表数据（每个主机独立）
  const [vclusterList, setVclusterList] = useState<Record<number, VClusterItem[]>>({});
  const [isLoadingVcluster, setIsLoadingVcluster] = useState<Record<number, boolean>>({});
  const [vclusterError, setVclusterError] = useState<Record<number, string | null>>({});

  // vtemplate 列表数据（每个主机独立）
  const [vtemplateList, setVtemplateList] = useState<Record<number, VTemplateItem[]>>({});
  const [isLoadingVtemplate, setIsLoadingVtemplate] = useState<Record<number, boolean>>({});
  const [vtemplateError, setVtemplateError] = useState<Record<number, string | null>>({});

  // vlan 列表数据（每个主机独立）
  const [vlanList, setVlanList] = useState<Record<number, VSwitchItem[]>>({});
  const [isLoadingVlan, setIsLoadingVlan] = useState<Record<number, boolean>>({});
  const [vlanError, setVlanError] = useState<Record<number, string | null>>({});



  // vdatastore 列表数据（每个主机独立）
  const [vdatastoreList, setVdatastoreList] = useState<Record<number, VStorageItem[]>>({});
  const [isLoadingVdatastore, setIsLoadingVdatastore] = useState<Record<number, boolean>>({});
  const [vdatastoreError, setVdatastoreError] = useState<Record<number, string | null>>({});

  // vstorageprofile 列表数据（每个主机独立）
  const [vstorageprofileList, setVstorageprofileList] = useState<Record<number, VStorageProfileItem[]>>({});
  const [isLoadingVstorageprofile, setIsLoadingVstorageprofile] = useState<Record<number, boolean>>({});
  const [vstorageprofileError, setVstorageprofileError] = useState<Record<number, string | null>>({});

  // 操作系统列表数据
  const [osList, setOsList] = useState<OSItem[]>([]);
  const [isLoadingOs, setIsLoadingOs] = useState(false);
  const [osError, setOsError] = useState<string | null>(null);
  
  // 获取 vcenter 列表
  const fetchVcenterList = async () => {
    setIsLoadingVcenter(true);
    setVcenterError(null);
    try {
      const response = await getVcenterListAction();
      setVcenterList(response.items || []);
    } catch (error) {
      console.error("获取 vcenter 列表失败:", error);
      setVcenterError("获取集群列表失败，请稍后重试");
      setVcenterList([]);
    } finally {
      setIsLoadingVcenter(false);
    }
  };

  // 获取操作系统列表
  const fetchOsList = async () => {
    setIsLoadingOs(true);
    setOsError(null);
    try {
      const response = await getOSListAction();
      const fetchedOsList = response.data || [];
      setOsList(fetchedOsList);

      // 如果有可用的OS选项且当前没有主机的OS被设置，则为现有主机设置默认值
      if (fetchedOsList.length > 0) {
        const defaultOs = fetchedOsList[0].software;

        // 为还没有设置操作系统的主机设置默认值
        fields.forEach((field, index) => {
          const currentOs = getValues(`hosts.${index}.os`);
          if (!currentOs) {
            setValue(`hosts.${index}.os`, defaultOs);
          }
        });
      }
    } catch (error) {
      console.error("获取操作系统列表失败:", error);
      setOsError("获取操作系统列表失败，请稍后重试");
      setOsList([]);
    } finally {
      setIsLoadingOs(false);
    }
  };
  
  // 获取 vdatacenter 列表
  const fetchVdatacenterList = async (hostIndex: number, vcenter: string) => {
    setIsLoadingVdatacenter(prev => ({ ...prev, [hostIndex]: true }));
    setVdatacenterError(prev => ({ ...prev, [hostIndex]: null }));
    try {
      const response = await getVDataCenterListAction(vcenter);
      const datacenters = response.items || [];
      setVdatacenterList(prev => ({ ...prev, [hostIndex]: datacenters }));
      // 自动选择第一个选项
      if (datacenters.length > 0) {
        setValue(`hosts.${hostIndex}.template`, datacenters[0].name);
        // 当数据中心自动选择后，自动获取集群列表
        fetchVclusterList(hostIndex, datacenters[0].name);
      } else {
        // 清除当前主机的模板选择和集群列表
        setValue(`hosts.${hostIndex}.template`, "");
        setValue(`hosts.${hostIndex}.vcluster`, "");
        setVclusterList(prev => {
          const updated = { ...prev };
          delete updated[hostIndex];
          return updated;
        });
      }
    } catch (error) {
      console.error("获取 vdatacenter 列表失败:", error);
      setVdatacenterError(prev => ({ ...prev, [hostIndex]: "获取数据中心列表失败，请稍后重试" }));
      setVdatacenterList(prev => ({ ...prev, [hostIndex]: [] }));
    } finally {
      setIsLoadingVdatacenter(prev => ({ ...prev, [hostIndex]: false }));
    }
  };
  
  // 获取 vcluster 列表
  const fetchVclusterList = async (hostIndex: number, vdatacenter: string) => {
    setIsLoadingVcluster(prev => ({ ...prev, [hostIndex]: true }));
    setVclusterError(prev => ({ ...prev, [hostIndex]: null }));
    try {
      const response = await getVClusterListAction(vdatacenter);
      const clusters = response.items || [];
      setVclusterList(prev => ({ ...prev, [hostIndex]: clusters }));
      // 自动选择第一个选项
      if (clusters.length > 0) {
        setValue(`hosts.${hostIndex}.vcluster`, clusters[0].name);
        // 当集群自动选择后，获取对应云链接的模板列表、VLAN 列表、VSwitch 列表和 VDataStore 列表
        const vcenterValue = getValues(`hosts.${hostIndex}.cluster`);
        if (vcenterValue) {
          fetchVtemplateList(hostIndex, vcenterValue);
          // 获取 VLAN 列表（需要 vcluster 和 vcenter）
          fetchVlanList(hostIndex, clusters[0].name, vcenterValue);
          // 获取 VDataStore 列表（需要 vcluster 和 vcenter）
          fetchVdatastoreList(hostIndex, clusters[0].name, vcenterValue);
          // 获取存储策略列表（需要 vcluster 和 vcenter）
          fetchVstorageprofileList(hostIndex, clusters[0].name, vcenterValue);
        }
      } else {
        // 清除当前主机的集群选择、模板列表和 VLAN 列表
        setValue(`hosts.${hostIndex}.vcluster`, "");
        setValue(`hosts.${hostIndex}.vtemplate`, "");
        setValue(`hosts.${hostIndex}.vlan`, "");
        setValue(`hosts.${hostIndex}.vdatastore`, "");
        setValue(`hosts.${hostIndex}.vstorageprofile`, "");
        setVtemplateList(prev => {
          const updated = { ...prev };
          delete updated[hostIndex];
          return updated;
        });
        setVlanList(prev => {
          const updated = { ...prev };
          delete updated[hostIndex];
          return updated;
        });
        setVdatastoreList(prev => {
          const updated = { ...prev };
          delete updated[hostIndex];
          return updated;
        });
        setVstorageprofileList(prev => {
          const updated = { ...prev };
          delete updated[hostIndex];
          return updated;
        });
      }
    } catch (error) {
      console.error("获取 vcluster 列表失败:", error);
      setVclusterError(prev => ({ ...prev, [hostIndex]: "获取集群列表失败，请稍后重试" }));
      setVclusterList(prev => ({ ...prev, [hostIndex]: [] }));
    } finally {
      setIsLoadingVcluster(prev => ({ ...prev, [hostIndex]: false }));
    }
  };
  
  // 获取 vtemplate 列表
  const fetchVtemplateList = async (hostIndex: number, vcenter: string) => {
    setIsLoadingVtemplate(prev => ({ ...prev, [hostIndex]: true }));
    setVtemplateError(prev => ({ ...prev, [hostIndex]: null }));
    try {
      const response = await getVTemplateListAction(vcenter);
      const templates = response.items || [];
      setVtemplateList(prev => ({ ...prev, [hostIndex]: templates }));
      // 自动选择第一个选项
      if (templates.length > 0) {
        setValue(`hosts.${hostIndex}.vtemplate`, templates[0].name);
      } else {
        // 清除当前主机的模板选择
        setValue(`hosts.${hostIndex}.vtemplate`, "");
      }
    } catch (error) {
      console.error("获取 vtemplate 列表失败:", error);
      setVtemplateError(prev => ({ ...prev, [hostIndex]: "获取主机模板列表失败，请稍后重试" }));
      setVtemplateList(prev => ({ ...prev, [hostIndex]: [] }));
    } finally {
      setIsLoadingVtemplate(prev => ({ ...prev, [hostIndex]: false }));
    }
  };
  
  // 获取 vlan 列表
  const fetchVlanList = async (hostIndex: number, vcluster: string, vcenter: string) => {
    setIsLoadingVlan(prev => ({ ...prev, [hostIndex]: true }));
    setVlanError(prev => ({ ...prev, [hostIndex]: null }));
    try {
      const response = await getVSwitchListAction(vcluster, vcenter);
      const vlans = response.items || [];
      setVlanList(prev => ({ ...prev, [hostIndex]: vlans }));
      // 自动选择第一个选项
      if (vlans.length > 0) {
        setValue(`hosts.${hostIndex}.vlan`, vlans[0].vlan);
      } else {
        // 清除当前主机的 VLAN 选择
        setValue(`hosts.${hostIndex}.vlan`, "");
      }
    } catch (error) {
      console.error("获取 vlan 列表失败:", error);
      setVlanError(prev => ({ ...prev, [hostIndex]: "获取 VLAN 列表失败，请稍后重试" }));
      setVlanList(prev => ({ ...prev, [hostIndex]: [] }));
    } finally {
      setIsLoadingVlan(prev => ({ ...prev, [hostIndex]: false }));
    }
  };
  

  
  // 获取 vdatastore 列表
  const fetchVdatastoreList = async (hostIndex: number, vcluster: string, vcenter: string) => {
    setIsLoadingVdatastore(prev => ({ ...prev, [hostIndex]: true }));
    setVdatastoreError(prev => ({ ...prev, [hostIndex]: null }));
    try {
      const response = await getVStorageListAction(vcluster, vcenter);
      const vdatastores = response.items || [];
      setVdatastoreList(prev => ({ ...prev, [hostIndex]: vdatastores }));
      // 自动选择第一个选项
      if (vdatastores.length > 0) {
        setValue(`hosts.${hostIndex}.vdatastore`, vdatastores[0].vstorage_id);
      } else {
        // 清除当前主机的 VDataStore 选择
        setValue(`hosts.${hostIndex}.vdatastore`, "");
      }
    } catch (error) {
      console.error("获取 vdatastore 列表失败:", error);
      setVdatastoreError(prev => ({ ...prev, [hostIndex]: "获取 VDataStore 列表失败，请稍后重试" }));
      setVdatastoreList(prev => ({ ...prev, [hostIndex]: [] }));
    } finally {
      setIsLoadingVdatastore(prev => ({ ...prev, [hostIndex]: false }));
    }
  };
  
  // 获取 vstorageprofile 列表
  const fetchVstorageprofileList = async (hostIndex: number, vcluster: string, vcenter: string) => {
    setIsLoadingVstorageprofile(prev => ({ ...prev, [hostIndex]: true }));
    setVstorageprofileError(prev => ({ ...prev, [hostIndex]: null }));
    try {
      const response = await getVStorageProfileListAction(vcluster, vcenter);
      const vstorageprofiles = response.items || [];
      setVstorageprofileList(prev => ({ ...prev, [hostIndex]: vstorageprofiles }));
      // 自动选择第一个选项
      if (vstorageprofiles.length > 0) {
        setValue(`hosts.${hostIndex}.vstorageprofile`, vstorageprofiles[0].vprofile_id);
      } else {
        // 清除当前主机的存储策略选择
        setValue(`hosts.${hostIndex}.vstorageprofile`, "");
      }
    } catch (error) {
      console.error("获取 vstorageprofile 列表失败:", error);
      setVstorageprofileError(prev => ({ ...prev, [hostIndex]: "获取存储策略列表失败，请稍后重试" }));
      setVstorageprofileList(prev => ({ ...prev, [hostIndex]: [] }));
    } finally {
      setIsLoadingVstorageprofile(prev => ({ ...prev, [hostIndex]: false }));
    }
  };
  
  // 初始加载
  useEffect(() => {
    fetchVcenterList();
    fetchOsList();
  }, []);

  // 字段列表，用于动画展示
  const fieldNames = [
    "env",
    "hostname",
    "type",
    "role",
    "os",
    "cpu",
    "memory",
    "disk",
    "cluster",
    "template",
    "vcluster",
    "vtemplate",
    "vlan",
    "vdatastore",
    "vstorageprofile",
    "description",
    "notes",
    "ipAddress",
  ];

  // 拷贝主机
  const handleCopyHost = (index: number) => {
    const currentHost = getValues(`hosts.${index}`);
    if (currentHost) {
      const currentHostname = currentHost.hostname || "";
      // 确保原主机名有后缀
      const hostnameWithSuffix = ensureHostnameSuffix(currentHostname);
      // 递增后缀数字
      const newHostname = incrementHostnameSuffix(hostnameWithSuffix);
      
      // 获取新添加的主机索引（append 后应该是 fields.length）
      const newIndex = fields.length;
      
      // 初始化卡片和字段动画状态：卡片和所有字段都不可见
      setCardVisibility((prev) => ({
        ...prev,
        [newIndex]: false,
      }));
      const visibleFields = new Set<string>();
      setAnimatingHosts((prev) => ({
        ...prev,
        [newIndex]: visibleFields,
      }));
      
      // 设置默认操作系统
      const defaultOs = osList.length > 0 ? osList[0].software : "";

      // 添加新主机
      append({
        ...currentHost,
        hostname: newHostname,
        os: defaultOs, // 设置默认操作系统
        ipAddress: "", // IP 地址清空，避免重复
      });
      
      // 显示复制成功的提示
      toast.success("主机复制成功", {
        icon: <CheckCircle2 className="h-4 w-4" />,
        duration: 2000,
        position: "top-right",
      });
      
      // 卡片逐渐显示，并添加高亮效果
      setTimeout(() => {
        setCardVisibility((prev) => ({
          ...prev,
          [newIndex]: true,
        }));
        // 添加高亮效果（呼吸动画）
        setHighlightedCards((prev) => new Set(prev).add(newIndex));
        // 呼吸效果一次后（约1秒），开始边框渐隐
        setTimeout(() => {
          setFadingBorderCards((prev) => new Set(prev).add(newIndex));
          // 边框渐隐动画完成后（约0.5秒），移除所有状态
          setTimeout(() => {
            setHighlightedCards((prev) => {
              const updated = new Set(prev);
              updated.delete(newIndex);
              return updated;
            });
            setFadingBorderCards((prev) => {
              const updated = new Set(prev);
              updated.delete(newIndex);
              return updated;
            });
          }, 500); // 边框渐隐动画时间
        }, 1000); // 呼吸动画时间（1秒，一次 pulse）
      }, 50);
      
      // 随机打乱字段顺序，然后逐个显示
      const shuffledFields = [...fieldNames].sort(() => Math.random() - 0.5);
      
      // 逐个显示字段，每个字段间隔 50-150ms
      shuffledFields.forEach((fieldName, fieldIndex) => {
        setTimeout(() => {
          setAnimatingHosts((prev) => {
            const current = prev[newIndex] || new Set();
            const updated = new Set(current);
            updated.add(fieldName);
            return {
              ...prev,
              [newIndex]: updated,
            };
          });
          
          // 如果是最后一个字段，动画完成后清理状态
          if (fieldIndex === shuffledFields.length - 1) {
            setTimeout(() => {
              setAnimatingHosts((prev) => {
                const updated = { ...prev };
                delete updated[newIndex];
                return updated;
              });
            }, 300);
          }
        }, fieldIndex * 80 + Math.random() * 50); // 每个字段延迟 80-130ms
      });
    }
  };
  
  // 检查字段是否应该显示（用于动画）
  const shouldShowField = (hostIndex: number, fieldName: string): boolean => {
    const animatingFields = animatingHosts[hostIndex];
    if (!animatingFields) return true; // 如果没有动画状态，默认显示
    return animatingFields.has(fieldName);
  };
  
  // 获取字段的动画类名
  const getFieldAnimationClass = (hostIndex: number, fieldName: string): string => {
    const isVisible = shouldShowField(hostIndex, fieldName);
    return `transition-all duration-300 ${
      isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 -translate-y-2 pointer-events-none"
    }`;
  };

  // TODO: 这些选项应该从 API 获取
  const envOptions = [
    { value: "prod", label: "生产环境" },
    { value: "test", label: "测试环境" },
    { value: "uat", label: "UAT 环境" },
    { value: "integration", label: "联调环境" },
  ];

  // 根据环境获取主机名前缀
  const getHostnamePrefix = (env: string): string => {
    const prefixMap: Record<string, string> = {
      prod: "p-",
      test: "t-",
      uat: "u-",
      integration: "l-",
    };
    return prefixMap[env] || "";
  };

  // 检查主机名是否已有任何环境前缀
  const hasAnyEnvPrefix = (hostname: string): boolean => {
    const allPrefixes = ["p-", "t-", "u-", "l-"];
    return allPrefixes.some((prefix) => hostname.startsWith(prefix));
  };

  // 移除主机名的环境前缀
  const removeEnvPrefix = (hostname: string): string => {
    const allPrefixes = ["p-", "t-", "u-", "l-"];
    for (const prefix of allPrefixes) {
      if (hostname.startsWith(prefix)) {
        return hostname.slice(prefix.length);
      }
    }
    return hostname;
  };

  // 检查主机名是否有数字后缀（如 "-001", "-002"）
  const hasNumericSuffix = (hostname: string): boolean => {
    const suffixPattern = /-\d+$/;
    return suffixPattern.test(hostname);
  };

  // 提取主机名的数字后缀
  const extractSuffixNumber = (hostname: string): number | null => {
    const match = hostname.match(/-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  // 移除主机名的数字后缀
  const removeNumericSuffix = (hostname: string): string => {
    return hostname.replace(/-\d+$/, "");
  };

  // 确保主机名有 "-001" 后缀，如果不存在则添加
  const ensureHostnameSuffix = (hostname: string): string => {
    if (!hostname) return hostname;
    if (hasNumericSuffix(hostname)) {
      return hostname;
    }
    return `${hostname}-001`;
  };

  // 更新主机名的环境前缀（保持后缀不变）
  const updateHostnamePrefix = (hostname: string, env: string): string => {
    if (!hostname || !env) return hostname;
    const prefix = getHostnamePrefix(env);
    if (!prefix) return hostname;
    
    // 提取后缀（如果存在）
    const hasSuffix = hasNumericSuffix(hostname);
    const suffix = hasSuffix ? hostname.match(/-\d+$/)![0] : "";
    const hostnameWithoutSuffix = hasSuffix ? removeNumericSuffix(hostname) : hostname;
    
    // 如果主机名已经有任何环境前缀，先移除旧前缀
    if (hasAnyEnvPrefix(hostnameWithoutSuffix)) {
      const hostnameWithoutPrefix = removeEnvPrefix(hostnameWithoutSuffix);
      // 如果新前缀和旧前缀相同，直接返回
      if (hostnameWithoutSuffix.startsWith(prefix)) return hostname;
      // 否则添加新前缀，并恢复后缀
      return `${prefix}${hostnameWithoutPrefix}${suffix}`;
    }
    
    // 如果主机名没有前缀，添加当前环境的前缀，并恢复后缀
    return `${prefix}${hostnameWithoutSuffix}${suffix}`;
  };

  // 递增主机名的数字后缀
  const incrementHostnameSuffix = (hostname: string): string => {
    if (!hostname) return hostname;
    if (hasNumericSuffix(hostname)) {
      const number = extractSuffixNumber(hostname);
      if (number !== null) {
        const newNumber = number + 1;
        const hostnameWithoutSuffix = removeNumericSuffix(hostname);
        return `${hostnameWithoutSuffix}-${String(newNumber).padStart(3, "0")}`;
      }
    }
    // 如果没有后缀，添加 "-002"（因为原主机名应该有 "-001"）
    return `${hostname}-002`;
  };

  // Convert OS items to options format for select component
  const osOptions = osList.map(os => ({
    value: os.software,
    label: os.software,
  }));

  const typeOptions = [
    { value: "hybrid", label: "混合 VM" },
    { value: "allflash", label: "全闪 VM" },
  ];

  const roleOptions = [
    { value: "generic", label: "通用服务器" },
    { value: "questdb", label: "QuestDB" },
    { value: "cratedb", label: "CrateDB" },
    { value: "risingwave", label: "RisingWave" },
    { value: "hashdata", label: "HashData" },
    { value: "mssql", label: "MSSQL" },
    { value: "vmware", label: "VMWare" },
    { value: "k8s", label: "K8S" },
    { value: "trino", label: "TRINO" },
    { value: "starrocks", label: "StarRocks" },
    { value: "redpanda", label: "RedPanda" },
    { value: "rabbitmq", label: "RabbitMQ" },
    { value: "oracle", label: "Oracle" },
    { value: "nifi", label: "NIFI" },
    { value: "mongodb", label: "MongoDB" },
    { value: "greenplum", label: "GreenPlum" },
    { value: "elk", label: "ELK" },
    { value: "edi", label: "EDI" },
    { value: "clickhouse", label: "ClickHouse" },
    { value: "redis", label: "Redis" },
    { value: "postgresql", label: "PostgresSQL" },
    { value: "mysql", label: "MySQL" },
  ];



  // State to track if component has mounted (for hydration purposes)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div className="space-y-4">
      {fields.length === 0 ? null : mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
              {fields.map((field, index) => {
                // 检查卡片是否应该显示（默认显示，除非在动画状态中）
                const isCardVisible = cardVisibility[index] !== false;
                return (
                  <SortableCardItem
                    key={field.id}
                    id={field.id}
                  >
                    <Card
                      className={`${
                        isCardVisible
                          ? deletingCards.has(index)
                            ? "opacity-0 scale-90 -translate-y-4 rotate-1 pointer-events-none transition-all duration-300"
                            : highlightedCards.has(index)
                            ? fadingBorderCards.has(index)
                              ? "opacity-100 scale-100 translate-y-0 shadow-lg ring-2 ring-green-500 ring-opacity-0 transition-all duration-500"
                              : "opacity-100 scale-100 translate-y-0 shadow-lg ring-2 ring-green-500 ring-opacity-50 animate-pulse transition-all duration-300"
                            : "opacity-100 scale-100 translate-y-0 transition-all duration-300"
                          : "opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300"
                      }`}
                    >
                      <CardContent>
                        <div className="flex justify-between items-center mb-3">
                          <SortableDragHandle id={field.id} />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                              onClick={() => handleCopyHost(index)}
                              title="复制主机"
                              aria-label="复制当前主机配置"
                            >
                              <Copy className="h-4 w-4 transition-transform duration-200" />
                            </Button>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                                onClick={() => {
                                  // 显示删除确认提示
                                  toast(
                                    "确定要删除这台主机吗？",
                                    {
                                      duration: 5000,
                                      position: "top-right",
                                      action: (
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                                          onClick={() => {
                                            // 标记为正在删除
                                            setDeletingCards((prev) => new Set(prev).add(index));
                                            // 先隐藏卡片
                                            setCardVisibility((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
                                            // 显示删除成功的提示
                                            toast.success("主机删除成功", {
                                              icon: <CheckCircle2 className="h-4 w-4" />,
                                              duration: 2000,
                                              position: "top-right",
                                            });
                                            // 延迟删除，等待动画完成
                                            setTimeout(() => {
                                              remove(index);
                                              // 清理状态
                                              setCardVisibility((prev) => {
                                                const updated = { ...prev };
                                                delete updated[index];
                                                return updated;
                                              });
                                              setAnimatingHosts((prev) => {
                                                const updated = { ...prev };
                                                delete updated[index];
                                                return updated;
                                              });
                                              setDeletingCards((prev) => {
                                                const updated = new Set(prev);
                                                updated.delete(index);
                                                return updated;
                                              });
                                              setHighlightedCards((prev) => {
                                                const updated = new Set(prev);
                                                updated.delete(index);
                                                return updated;
                                              });
                                            }, 400); // 等待动画完成
                                          }}
                                        >
                                          确定
                                        </Button>
                                      ),
                                    }
                                  );
                                }}
                                title="删除主机"
                                aria-label="删除当前主机"
                              >
                                <Trash2 className="h-4 w-4 text-destructive transition-transform duration-200 hover:rotate-12" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 基础信息组 */}
                  <FormField
                    control={control}
                    name={`hosts.${index}.env`}
                    render={({ field, formState: { errors } }) => {
                      const error = errors.hosts?.[index]?.env;
                      return (
                        <FormItem className={getFieldAnimationClass(index, "env")}>
                          <FormLabel id={`hosts-${index}-env-label`}>
                            隶属环境
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // 环境变化时，自动更新主机名前缀
                              const currentHostname = getValues(`hosts.${index}.hostname`) || "";
                              if (currentHostname) {
                                const newHostname = updateHostnamePrefix(currentHostname, value);
                                setValue(`hosts.${index}.hostname`, newHostname, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl 
                              className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                              aria-labelledby={`hosts-${index}-env-label`}
                              aria-required="true"
                              aria-invalid={!!error}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="请选择隶属环境" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {envOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={control}
                    name={`hosts.${index}.hostname`}
                    render={({ field, formState: { errors } }) => {
                      const error = errors.hosts?.[index]?.hostname;
                      const currentEnv = getValues(`hosts.${index}.env`) || "";
                      return (
                        <FormItem className={getFieldAnimationClass(index, "hostname")}>
                          <FormLabel id={`hosts-${index}-hostname-label`}>
                            主机名
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl 
                            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                            aria-labelledby={`hosts-${index}-hostname-label`}
                            aria-required="true"
                            aria-invalid={!!error}
                          >
                            <Input
                              placeholder="请输入主机名"
                              {...field}
                              aria-describedby={!error ? `hosts-${index}-hostname-hint` : undefined}
                              onBlur={(e) => {
                                // 失去焦点时，检查并更新前缀和后缀
                                let hostname = e.target.value;
                                if (hostname) {
                                  // 先更新前缀（如果环境已选择）
                                  if (currentEnv) {
                                    const oldHostname = hostname;
                                    hostname = updateHostnamePrefix(hostname, currentEnv);
                                    // 然后确保有后缀
                                    hostname = ensureHostnameSuffix(hostname);
                                    if (hostname !== oldHostname) {
                                      field.onChange(hostname);
                                      // 显示主机名自动更新的提示
                                      toast.success("主机名已自动优化", {
                                        description: `已更新为: ${hostname}`,
                                        icon: <CheckCircle2 className="h-4 w-4" />,
                                        duration: 2000,
                                        position: "top-right",
                                      });
                                    }
                                  } else {
                                    // 确保有后缀
                                    hostname = ensureHostnameSuffix(hostname);
                                    if (hostname !== e.target.value) {
                                      field.onChange(hostname);
                                    }
                                  }
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />

                  {/* 类型、角色、操作系统 - 排成一行 */}
                  <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name={`hosts.${index}.type`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.type;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "type")}>
                            <FormLabel id={`hosts-${index}-type-label`}>
                              类型
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl 
                                aria-labelledby={`hosts-${index}-type-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="请选择类型" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {typeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.role`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.role;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "role")}>
                            <FormLabel id={`hosts-${index}-role-label`}>
                              角色
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl 
                                aria-labelledby={`hosts-${index}-role-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="请选择角色" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roleOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.os`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.os;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "os")}>
                            <FormLabel id={`hosts-${index}-os-label`}>
                              操作系统
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl
                                aria-labelledby={`hosts-${index}-os-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={isLoadingOs ? "加载中..." : "请选择操作系统"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingOs ? (
                                  <SelectItem value="__loading" disabled>
                                    加载中...
                                  </SelectItem>
                                ) : osError ? (
                                  <SelectItem value="__error" disabled>
                                    加载失败: {osError}
                                  </SelectItem>
                                ) : osOptions.length > 0 ? (
                                  osOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="__empty" disabled>
                                    暂无操作系统选项
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* CPU、内存、磁盘 - 排成一行 */}
                  <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name={`hosts.${index}.cpu`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.cpu;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "cpu")}>
                            <FormLabel id={`hosts-${index}-cpu-label`}>
                              CPU
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl 
                              aria-labelledby={`hosts-${index}-cpu-label`}
                              aria-required="true"
                              aria-invalid={!!error}
                            >
                              <Input
                                type="number"
                                min="1"
                                max="32"
                                placeholder="请输入 CPU 核数 (1-32)"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // 只允许输入正整数
                                  if (value === "" || /^\d+$/.test(value)) {
                                    if (value === "") {
                                      field.onChange(value);
                                    } else {
                                      const numValue = parseInt(value, 10);
                                      // 限制范围
                                      if (numValue >= 1 && numValue <= 32) {
                                        field.onChange(value);
                                        // 自动计算内存为 CPU 的 2 倍
                                        const memoryValue = Math.min(numValue * 2, 64).toString();
                                        setValue(`hosts.${index}.memory`, memoryValue, {
                                          shouldValidate: true,
                                        });
                                      }
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.memory`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.memory;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "memory")}>
                            <FormLabel id={`hosts-${index}-memory-label`}>
                              内存 (GB)
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl 
                              aria-labelledby={`hosts-${index}-memory-label`}
                              aria-required="true"
                              aria-invalid={!!error}
                            >
                              <Input
                                type="number"
                                min="1"
                                max="64"
                                placeholder="请输入内存大小 (1-64)"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // 只允许输入正整数
                                  if (value === "" || /^\d+$/.test(value)) {
                                    if (value === "") {
                                      field.onChange(value);
                                    } else {
                                      const numValue = parseInt(value, 10);
                                      // 限制范围
                                      if (numValue >= 1 && numValue <= 64) {
                                        field.onChange(value);
                                      }
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.disk`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.disk;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "disk")}>
                            <FormLabel id={`hosts-${index}-disk-label`}>
                              磁盘 (GB)
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl 
                              aria-labelledby={`hosts-${index}-disk-label`}
                              aria-required="true"
                              aria-invalid={!!error}
                            >
                              <Input
                                type="number"
                                min="100"
                                max="1000"
                                step="100"
                                placeholder="请输入磁盘大小 (100 的倍数, 最大 1000)"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // 允许输入空值或正整数
                                  if (value === "" || /^\d+$/.test(value)) {
                                    if (value === "") {
                                      field.onChange(value);
                                    } else {
                                      const numValue = parseInt(value, 10);
                                      // 限制范围：1-1000，允许输入过程中不满足 100 倍数
                                      if (numValue >= 1 && numValue <= 1000) {
                                        field.onChange(value);
                                      }
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  const value = e.target.value;
                                  if (value !== "") {
                                    const numValue = parseInt(value, 10);
                                    if (!isNaN(numValue) && numValue >= 100 && numValue <= 1000) {
                                      // 修正为最接近的 100 的倍数
                                      const rounded = Math.round(numValue / 100) * 100;
                                      const finalValue = Math.max(100, Math.min(1000, rounded));
                                      field.onChange(finalValue.toString());
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* 文本字段组 - 并排显示 */}
                  <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`hosts.${index}.description`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.description;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "description")}>
                            <FormLabel id={`hosts-${index}-description-label`}>用途描述</FormLabel>
                            <FormControl 
                              aria-labelledby={`hosts-${index}-description-label`}
                              aria-invalid={!!error}
                            >
                              <Textarea
                                placeholder="用途描述展示在堡垒机"
                                className="resize-none"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.notes`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.notes;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "notes")}>
                            <FormLabel id={`hosts-${index}-notes-label`}>注意事项</FormLabel>
                            <FormControl 
                              aria-labelledby={`hosts-${index}-notes-label`}
                              aria-invalid={!!error}
                            >
                              <Textarea
                                placeholder="给资源管理员的悄悄话"
                                className="resize-none"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                  {/* 横线分隔 - 隐藏字段与非隐藏字段 */}
                  <div className="sm:col-span-2 lg:col-span-3 border-t border-border my-4"></div>

                  {/* 隐藏字段组 - 暂时显示用于调试布局 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 部署配置组 */}
                    <FormField
                        control={control}
                        name={`hosts.${index}.cluster`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.cluster;
                          // 确保 fetchVcenterList 函数在 render 函数中可见
                          const handleRetry = () => {
                            fetchVcenterList();
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "cluster")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-cluster-label`}>云链接</FormLabel>
                                {vcenterError && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取集群列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // 当选择集群时，自动获取对应的 vdatacenter 列表
                                  if (value) {
                                    fetchVdatacenterList(index, value);
                                  } else {
                                    // 清除选择时，也清除对应的 vdatacenter 列表
                                    setVdatacenterList(prev => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                    setVdatacenterError(prev => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                    setValue(`hosts.${index}.template`, "");
                                  }
                                }} 
                                value={field.value} 
                                disabled={isLoadingVcenter || !!vcenterError}
                              >
                                <FormControl 
                                  className={vcenterError ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-cluster-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={isLoadingVcenter || !!vcenterError}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        isLoadingVcenter 
                                          ? "加载中..." 
                                          : vcenterError 
                                            ? "加载失败" 
                                            : "请选择云链接"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vcenterList.length === 0 && !isLoadingVcenter && !vcenterError ? (
                                    <SelectItem value="none" disabled>
                                      暂无集群数据
                                    </SelectItem>
                                  ) : (
                                    vcenterList.map((vcenter) => (
                                      <SelectItem key={vcenter.id} value={vcenter.name}>
                                        {vcenter.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {vcenterError && (
                                <p className="text-xs text-destructive mt-1">
                                  {vcenterError}
                                </p>
                              )}
                              <FormMessage className="text-xs" />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.template`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.template;
                          const datacenters = vdatacenterList[index] || [];
                          const isLoading = isLoadingVdatacenter[index] || false;
                          const datacenterError = vdatacenterError[index] || null;
                          const clusterValue = getValues(`hosts.${index}.cluster`);
                          
                          // 重试获取 vdatacenter 列表
                          const handleRetry = () => {
                            if (clusterValue) {
                              fetchVdatacenterList(index, clusterValue);
                            }
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "template")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-template-label`}>数据中心</FormLabel>
                                {datacenterError && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取数据中心列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // 当选择数据中心时，自动获取对应的集群列表
                                  if (value) {
                                    fetchVclusterList(index, value);
                                  } else {
                                    // 清除选择时，也清除对应的集群列表
                                    setVclusterList(prev => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                    setVclusterError(prev => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                    setValue(`hosts.${index}.vcluster`, "");
                                  }
                                }} 
                                value={field.value}
                                disabled={!clusterValue || isLoading || !!datacenterError}
                              >
                                <FormControl 
                                  className={datacenterError ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-template-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={!clusterValue || isLoading || !!datacenterError}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        !clusterValue
                                          ? "请先选择云链接"
                                          : isLoading
                                            ? "加载中..."
                                            : datacenterError
                                              ? "加载失败"
                                              : "请选择数据中心"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {datacenters.length === 0 && !isLoading && !datacenterError ? (
                                    <SelectItem value="none" disabled>
                                      暂无数据中心数据
                                    </SelectItem>
                                  ) : (
                                    datacenters.map((datacenter) => (
                                      <SelectItem key={datacenter.id} value={datacenter.name}>
                                        {datacenter.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {datacenterError && (
                                <p className="text-xs text-destructive mt-1">
                                  {datacenterError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.vcluster`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.vcluster;
                          const clusters = vclusterList[index] || [];
                          const isLoading = isLoadingVcluster[index] || false;
                          const clusterError = vclusterError[index] || null;
                          const templateValue = getValues(`hosts.${index}.template`);
                          
                          // 重试获取 vcluster 列表
                          const handleRetry = () => {
                            if (templateValue) {
                              fetchVclusterList(index, templateValue);
                            }
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "vcluster")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-vcluster-label`}>隶属集群</FormLabel>
                                {clusterError && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取集群列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!templateValue || isLoading || !!clusterError}
                              >
                                <FormControl 
                                  className={clusterError ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-vcluster-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={!templateValue || isLoading || !!clusterError}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        !templateValue
                                          ? "请先选择数据中心"
                                          : isLoading
                                            ? "加载中..."
                                            : clusterError
                                              ? "加载失败"
                                              : "请选择隶属集群"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {clusters.length === 0 && !isLoading && !clusterError ? (
                                    <SelectItem value="none" disabled>
                                      暂无集群数据
                                    </SelectItem>
                                  ) : (
                                    clusters.map((cluster) => (
                                      <SelectItem key={cluster.id} value={cluster.name}>
                                        {cluster.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {clusterError && (
                                <p className="text-xs text-destructive mt-1">
                                  {clusterError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.vtemplate`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.vtemplate;
                          const templates = vtemplateList[index] || [];
                          const isLoading = isLoadingVtemplate[index] || false;
                          const templateError = vtemplateError[index] || null;
                          const clusterValue = getValues(`hosts.${index}.cluster`);
                          
                          // 重试获取 vtemplate 列表
                          const handleRetry = () => {
                            if (clusterValue) {
                              fetchVtemplateList(index, clusterValue);
                            }
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "vtemplate")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-vtemplate-label`}>主机模版</FormLabel>
                                {templateError && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取主机模板列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!clusterValue || isLoading || !!templateError}
                              >
                                <FormControl 
                                  className={templateError ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-vtemplate-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={!clusterValue || isLoading || !!templateError}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        !clusterValue
                                          ? "请先选择云链接"
                                          : isLoading
                                            ? "加载中..."
                                            : templateError
                                              ? "加载失败"
                                              : "请选择主机模版"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {templates.length === 0 && !isLoading && !templateError ? (
                                    <SelectItem value="none" disabled>
                                      暂无主机模板数据
                                    </SelectItem>
                                  ) : (
                                    templates.map((template) => (
                                      <SelectItem key={template.id} value={template.name}>
                                        {template.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {templateError && (
                                <p className="text-xs text-destructive mt-1">
                                  {templateError}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* 网络配置组 */}
                      <FormField
                        control={control}
                        name={`hosts.${index}.vlan`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.vlan;
                          const vlans = vlanList[index] || [];
                          const isLoading = isLoadingVlan[index] || false;
                          const vlanErrorMsg = vlanError[index] || null;
                          const vclusterValue = getValues(`hosts.${index}.vcluster`);
                          const vcenterValue = getValues(`hosts.${index}.cluster`);
                          
                          // 重试获取 vlan 列表
                          const handleRetry = () => {
                            if (vclusterValue && vcenterValue) {
                              fetchVlanList(index, vclusterValue, vcenterValue);
                            }
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "vlan")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-vlan-label`}>VLAN</FormLabel>
                                {vlanErrorMsg && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取 VLAN 列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!vclusterValue || !vcenterValue || isLoading || !!vlanErrorMsg}
                              >
                                <FormControl 
                                  className={vlanErrorMsg ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-vlan-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={!vclusterValue || !vcenterValue || isLoading || !!vlanErrorMsg}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        !vclusterValue || !vcenterValue
                                          ? "请先选择隶属集群"
                                          : isLoading
                                            ? "加载中..."
                                            : vlanErrorMsg
                                              ? "加载失败"
                                              : "请选择 VLAN"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vlans.length === 0 && !isLoading && !vlanErrorMsg ? (
                                    <SelectItem value="none" disabled>
                                      暂无 VLAN 数据
                                    </SelectItem>
                                  ) : (
                                    vlans.map((vlan) => (
                                      <SelectItem key={vlan.id} value={vlan.vlan}>
                                        {vlan.name} (VLAN {vlan.vlan}, Subnet {vlan.subnet})
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {vlanErrorMsg && (
                                <p className="text-xs text-destructive mt-1">
                                  {vlanErrorMsg}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />



                      <FormField
                        control={control}
                        name={`hosts.${index}.vdatastore`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.vdatastore;
                          const vdatastores = vdatastoreList[index] || [];
                          const isLoading = isLoadingVdatastore[index] || false;
                          const vdatastoreErrorMsg = vdatastoreError[index] || null;
                          const vclusterValue = getValues(`hosts.${index}.vcluster`);
                          const vcenterValue = getValues(`hosts.${index}.cluster`);
                          
                          // 重试获取 vdatastore 列表
                          const handleRetry = () => {
                            if (vclusterValue && vcenterValue) {
                              fetchVdatastoreList(index, vclusterValue, vcenterValue);
                            }
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "vdatastore")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-vdatastore-label`}>VDataStore</FormLabel>
                                {vdatastoreErrorMsg && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取 VDataStore 列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!vclusterValue || !vcenterValue || isLoading || !!vdatastoreErrorMsg}
                              >
                                <FormControl 
                                  className={vdatastoreErrorMsg ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-vdatastore-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={!vclusterValue || !vcenterValue || isLoading || !!vdatastoreErrorMsg}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        !vclusterValue || !vcenterValue
                                          ? "请先选择隶属集群"
                                          : isLoading
                                            ? "加载中..."
                                            : vdatastoreErrorMsg
                                              ? "加载失败"
                                              : "请选择 VDataStore"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vdatastores.length === 0 && !isLoading && !vdatastoreErrorMsg ? (
                                    <SelectItem value="none" disabled>
                                      暂无 VDataStore 数据
                                    </SelectItem>
                                  ) : (
                                    vdatastores.map((vdatastore) => (
                                      <SelectItem key={vdatastore.id} value={vdatastore.vstorage_id}>
                                        {vdatastore.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {vdatastoreErrorMsg && (
                                <p className="text-xs text-destructive mt-1">
                                  {vdatastoreErrorMsg}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.vstorageprofile`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.vstorageprofile;
                          const vstorageprofiles = vstorageprofileList[index] || [];
                          const isLoading = isLoadingVstorageprofile[index] || false;
                          const vstorageprofileErrorMsg = vstorageprofileError[index] || null;
                          const vclusterValue = getValues(`hosts.${index}.vcluster`);
                          const vcenterValue = getValues(`hosts.${index}.cluster`);
                          
                          // 重试获取 vstorageprofile 列表
                          const handleRetry = () => {
                            if (vclusterValue && vcenterValue) {
                              fetchVstorageprofileList(index, vclusterValue, vcenterValue);
                            }
                          };
                          
                          return (
                            <FormItem className={getFieldAnimationClass(index, "vstorageprofile")}>
                              <div className="flex justify-between items-center">
                                <FormLabel id={`hosts-${index}-vstorageprofile-label`}>存储策略</FormLabel>
                                {vstorageprofileErrorMsg && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                    className="h-7 px-2 text-xs"
                                    aria-label="重试获取存储策略列表"
                                  >
                                    重试
                                  </Button>
                                )}
                              </div>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={!vclusterValue || !vcenterValue || isLoading || !!vstorageprofileErrorMsg}
                              >
                                <FormControl 
                                  className={vstorageprofileErrorMsg ? "border-destructive focus-visible:ring-destructive" : ""}
                                  aria-labelledby={`hosts-${index}-vstorageprofile-label`}
                                  aria-invalid={!!error}
                                  aria-disabled={!vclusterValue || !vcenterValue || isLoading || !!vstorageprofileErrorMsg}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue 
                                      placeholder={
                                        !vclusterValue || !vcenterValue
                                          ? "请先选择隶属集群"
                                          : isLoading
                                            ? "加载中..."
                                            : vstorageprofileErrorMsg
                                              ? "加载失败"
                                              : "请选择存储策略"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vstorageprofiles.length === 0 && !isLoading && !vstorageprofileErrorMsg ? (
                                    <SelectItem value="none" disabled>
                                      暂无存储策略数据
                                    </SelectItem>
                                  ) : (
                                    vstorageprofiles.map((vstorageprofile) => (
                                      <SelectItem key={vstorageprofile.id} value={vstorageprofile.vprofile_id}>
                                        {vstorageprofile.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {vstorageprofileErrorMsg && (
                                <p className="text-xs text-destructive mt-1">
                                  {vstorageprofileErrorMsg}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.ipAddress`}
                        render={({ field, formState: { errors } }) => {
                          const error = errors.hosts?.[index]?.ipAddress;
                          return (
                            <FormItem className={getFieldAnimationClass(index, "ipAddress")}>
                              <FormLabel id={`hosts-${index}-ipAddress-label`}>IP 地址</FormLabel>
                              <FormControl 
                                aria-labelledby={`hosts-${index}-ipAddress-label`}
                                aria-invalid={!!error}
                              >
                                <Input placeholder="请输入 IP 地址" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </CardContent>
                  </Card>
                  </SortableCardItem>
                );
              })}
          </SortableContext>
        </DndContext>
      ) : (
        // Fallback during hydration to prevent mismatches
        <div className="space-y-4">
          {fields.map((field, index) => {
            // 检查卡片是否应该显示（默认显示，除非在动画状态中）
            const isCardVisible = cardVisibility[index] !== false;
            return (
              <Card
                key={field.id}
                className={`${
                  isCardVisible
                    ? deletingCards.has(index)
                      ? "opacity-0 scale-90 -translate-y-4 rotate-1 pointer-events-none transition-all duration-300"
                      : highlightedCards.has(index)
                      ? fadingBorderCards.has(index)
                        ? "opacity-100 scale-100 translate-y-0 shadow-lg ring-2 ring-green-500 ring-opacity-0 transition-all duration-500"
                        : "opacity-100 scale-100 translate-y-0 shadow-lg ring-2 ring-green-500 ring-opacity-50 animate-pulse transition-all duration-300"
                      : "opacity-100 scale-100 translate-y-0 transition-all duration-300"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300"
                }`}
              >
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <div
                      className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded"
                      title="拖拽调整顺序"
                      aria-label="拖拽调整主机顺序"
                      tabIndex={0}
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        onClick={() => handleCopyHost(index)}
                        title="复制主机"
                        aria-label="复制当前主机配置"
                      >
                        <Copy className="h-4 w-4 transition-transform duration-200" />
                      </Button>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                          onClick={() => {
                            // 显示删除确认提示
                            toast(
                              "确定要删除这台主机吗？",
                              {
                                duration: 5000,
                                position: "top-right",
                                action: (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                                    onClick={() => {
                                      // 标记为正在删除
                                      setDeletingCards((prev) => new Set(prev).add(index));
                                      // 先隐藏卡片
                                      setCardVisibility((prev) => ({
                                        ...prev,
                                        [index]: false,
                                      }));
                                      // 显示删除成功的提示
                                      toast.success("主机删除成功", {
                                        icon: <CheckCircle2 className="h-4 w-4" />,
                                        duration: 2000,
                                        position: "top-right",
                                      });
                                      // 延迟删除，等待动画完成
                                      setTimeout(() => {
                                        remove(index);
                                        // 清理状态
                                        setCardVisibility((prev) => {
                                          const updated = { ...prev };
                                          delete updated[index];
                                          return updated;
                                        });
                                        setAnimatingHosts((prev) => {
                                          const updated = { ...prev };
                                          delete updated[index];
                                          return updated;
                                        });
                                        setDeletingCards((prev) => {
                                          const updated = new Set(prev);
                                          updated.delete(index);
                                          return updated;
                                        });
                                        setHighlightedCards((prev) => {
                                          const updated = new Set(prev);
                                          updated.delete(index);
                                          return updated;
                                        });
                                      }, 400); // 等待动画完成
                                    }}
                                  >
                                    确定
                                  </Button>
                                ),
                              }
                            );
                          }}
                          title="删除主机"
                          aria-label="删除当前主机"
                        >
                          <Trash2 className="h-4 w-4 text-destructive transition-transform duration-200 hover:rotate-12" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 基础信息组 - 使用相同的渲染逻辑但 without DnD */}
                    {/* This is a simplified fallback without DnD functionality */}
                    {/* Environment field */}
                    <FormField
                      control={control}
                      name={`hosts.${index}.env`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.env;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "env")}>
                            <FormLabel id={`hosts-${index}-env-label`}>
                              隶属环境
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // 环境变化时，自动更新主机名前缀
                                const currentHostname = getValues(`hosts.${index}.hostname`) || "";
                                if (currentHostname) {
                                  const newHostname = updateHostnamePrefix(currentHostname, value);
                                  setValue(`hosts.${index}.hostname`, newHostname, {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl
                                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                                aria-labelledby={`hosts-${index}-env-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="请选择隶属环境" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {envOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Hostname field */}
                    <FormField
                      control={control}
                      name={`hosts.${index}.hostname`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.hostname;
                        const currentEnv = getValues(`hosts.${index}.env`) || "";
                        return (
                          <FormItem className={getFieldAnimationClass(index, "hostname")}>
                            <FormLabel id={`hosts-${index}-hostname-label`}>
                              主机名
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl
                              className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                              aria-labelledby={`hosts-${index}-hostname-label`}
                              aria-required="true"
                              aria-invalid={!!error}
                            >
                              <Input
                                placeholder="请输入主机名"
                                {...field}
                                aria-describedby={!error ? `hosts-${index}-hostname-hint` : undefined}
                                onBlur={(e) => {
                                  // 失去焦点时，检查并更新前缀和后缀
                                  let hostname = e.target.value;
                                  if (hostname) {
                                    // 先更新前缀（如果环境已选择）
                                    if (currentEnv) {
                                      const oldHostname = hostname;
                                      hostname = updateHostnamePrefix(hostname, currentEnv);
                                      // 然后确保有后缀
                                      hostname = ensureHostnameSuffix(hostname);
                                      if (hostname !== oldHostname) {
                                        field.onChange(hostname);
                                        // 显示主机名自动更新的提示
                                        toast.success("主机名已自动优化", {
                                          description: `已更新为: ${hostname}`,
                                          icon: <CheckCircle2 className="h-4 w-4" />,
                                          duration: 2000,
                                          position: "top-right",
                                        });
                                      }
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Type field */}
                    <FormField
                      control={control}
                      name={`hosts.${index}.type`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.type;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "type")}>
                            <FormLabel id={`hosts-${index}-type-label`}>
                              类型
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl
                                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                                aria-labelledby={`hosts-${index}-type-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="请选择类型" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {typeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Role field */}
                    <FormField
                      control={control}
                      name={`hosts.${index}.role`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.role;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "role")}>
                            <FormLabel id={`hosts-${index}-role-label`}>
                              角色
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl
                                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                                aria-labelledby={`hosts-${index}-role-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="请选择角色" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roleOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />

                    {/* OS field - using the updated OS options */}
                    <FormField
                      control={control}
                      name={`hosts.${index}.os`}
                      render={({ field, formState: { errors } }) => {
                        const error = errors.hosts?.[index]?.os;
                        return (
                          <FormItem className={getFieldAnimationClass(index, "os")}>
                            <FormLabel id={`hosts-${index}-os-label`}>
                              操作系统
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl
                                aria-labelledby={`hosts-${index}-os-label`}
                                aria-required="true"
                                aria-invalid={!!error}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={isLoadingOs ? "加载中..." : "请选择操作系统"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingOs ? (
                                  <SelectItem value="__loading" disabled>
                                    加载中...
                                  </SelectItem>
                                ) : osError ? (
                                  <SelectItem value="__error" disabled>
                                    加载失败: {osError}
                                  </SelectItem>
                                ) : osOptions.length > 0 ? (
                                  osOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="__empty" disabled>
                                    暂无操作系统选项
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Other fields would follow the same pattern */}
                    {/* For brevity, showing only the first few fields in the fallback */}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 可拖拽的卡片包装组件
function SortableCardItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}

// 拖拽手柄组件
function SortableDragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded"
      title="拖拽调整顺序"
      aria-label="拖拽调整主机顺序"
      tabIndex={0}
    >
      <GripVertical className="h-5 w-5" />
    </div>
  );
}

