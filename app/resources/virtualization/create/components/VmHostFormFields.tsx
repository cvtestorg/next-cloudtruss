import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Trash2, Copy, GripVertical } from "lucide-react";
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
    "vlan",
    "ipAddress",
    "mask",
    "gateway",
    "vswitch",
    "vdatastore",
    "description",
    "notes",
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
      
      // 添加新主机
      append({
        ...currentHost,
        hostname: newHostname,
        ipAddress: "", // IP 地址清空，避免重复
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

  const osOptions = [
    { value: "ubuntu24", label: "Ubuntu24" },
    { value: "rockylinux9", label: "RockyLinux9" },
    { value: "windows2022", label: "Windows2022" },
    { value: "rockylinux8", label: "RockyLinux8" },
    { value: "ubuntu22", label: "Ubuntu22" },
    { value: "windows2016", label: "Windows2016" },
  ];

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



  return (
    <div className="space-y-4">
      {fields.length === 0 ? null : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
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
                    className="h-8 w-8 transition-transform duration-200 hover:scale-110 active:scale-95"
                    onClick={() => handleCopyHost(index)}
                    title="复制主机"
                  >
                        <Copy className="h-4 w-4 transition-transform duration-200" />
                      </Button>
                      {fields.length > 1 && (
                        <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // 标记为正在删除
                        setDeletingCards((prev) => new Set(prev).add(index));
                        // 先隐藏卡片
                        setCardVisibility((prev) => ({
                          ...prev,
                          [index]: false,
                        }));
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
                      title="删除主机"
                    >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 基础信息组 */}
                  <FormField
                    control={control}
                    name={`hosts.${index}.env`}
                    render={({ field }) => (
                      <FormItem className={getFieldAnimationClass(index, "env")}>
                        <FormLabel>
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
                          <FormControl>
                            <SelectTrigger className="w-[200px]">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`hosts.${index}.hostname`}
                    render={({ field }) => {
                      const currentEnv = getValues(`hosts.${index}.env`) || "";
                      return (
                        <FormItem className={getFieldAnimationClass(index, "hostname")}>
                          <FormLabel>
                            主机名
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入主机名"
                              {...field}
                              onBlur={(e) => {
                                // 失去焦点时，检查并更新前缀和后缀
                                let hostname = e.target.value;
                                if (hostname) {
                                  // 先更新前缀（如果环境已选择）
                                  if (currentEnv) {
                                    hostname = updateHostnamePrefix(hostname, currentEnv);
                                  }
                                  // 然后确保有后缀
                                  hostname = ensureHostnameSuffix(hostname);
                                  if (hostname !== e.target.value) {
                                    field.onChange(hostname);
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

                  {/* 类型、角色、操作系统 - 排成一行 */}
                  <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name={`hosts.${index}.type`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "type")}>
                          <FormLabel>
                            类型
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
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
                      )}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.role`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "role")}>
                          <FormLabel>
                            角色
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
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
                      )}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.os`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "os")}>
                          <FormLabel>
                            操作系统
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="请选择操作系统" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {osOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 资源配置组 - 单独一排 */}
                  <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name={`hosts.${index}.cpu`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "cpu")}>
                          <FormLabel>
                            CPU
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
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
                      )}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.memory`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "memory")}>
                          <FormLabel>
                            内存 (GB)
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
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
                      )}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.disk`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "disk")}>
                          <FormLabel>
                            磁盘 (GB)
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
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
                      )}
                    />
                  </div>

                  {/* 文本字段组 - 并排显示 */}
                  <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`hosts.${index}.description`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "description")}>
                          <FormLabel>用途描述</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="用途描述展示在堡垒机"
                              className="resize-none"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`hosts.${index}.notes`}
                      render={({ field }) => (
                        <FormItem className={getFieldAnimationClass(index, "notes")}>
                          <FormLabel>注意事项</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="给资源管理员的悄悄话"
                              className="resize-none"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 横线分隔 - 隐藏字段与非隐藏字段 */}
                  <div className="md:col-span-2 lg:col-span-3 border-t border-border my-4"></div>

                  {/* 隐藏字段组 - 暂时显示用于调试布局 */}
                  <>
                    {/* 部署配置组 */}
                    <FormField
                        control={control}
                        name={`hosts.${index}.cluster`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "cluster")}>
                            <FormLabel>隶属集群</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="请选择隶属集群" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cluster1">集群1</SelectItem>
                                <SelectItem value="cluster2">集群2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.template`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "template")}>
                            <FormLabel>模版</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="请选择模版" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="template1">模版1</SelectItem>
                                <SelectItem value="template2">模版2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 网络配置组 */}
                      <FormField
                        control={control}
                        name={`hosts.${index}.vlan`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "vlan")}>
                            <FormLabel>VLAN</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="请选择 VLAN" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vlan1">VLAN 1</SelectItem>
                                <SelectItem value="vlan2">VLAN 2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.ipAddress`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "ipAddress")}>
                            <FormLabel>IP 地址</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入 IP 地址" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.mask`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "mask")}>
                            <FormLabel>子网掩码</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入子网掩码" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.gateway`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "gateway")}>
                            <FormLabel>网关</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入网关地址" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.vswitch`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "vswitch")}>
                            <FormLabel>VSwitch</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="请选择 VSwitch" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vswitch1">VSwitch 1</SelectItem>
                                <SelectItem value="vswitch2">VSwitch 2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`hosts.${index}.vdatastore`}
                        render={({ field }) => (
                          <FormItem className={getFieldAnimationClass(index, "vdatastore")}>
                            <FormLabel>VDataStore</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="请选择 VDataStore" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vdatastore1">VDataStore 1</SelectItem>
                                <SelectItem value="vdatastore2">VDataStore 2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </>
                </div>
              </CardContent>
            </Card>
              </SortableCardItem>
            );
          })}
            </div>
          </SortableContext>
        </DndContext>
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
    transform: CSS.Transform.toString(transform),
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
      className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
      title="拖拽调整顺序"
    >
      <GripVertical className="h-5 w-5" />
    </div>
  );
}

