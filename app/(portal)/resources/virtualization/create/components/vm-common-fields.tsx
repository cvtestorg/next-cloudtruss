import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "./date-picker";
import { UserSelect } from "./user-select";
import { ProjectSelect } from "./project-select";
import type { VmCreateFormData } from "@/schemas/vm-create";

export function VmCommonFields() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField
          control={useFormContext<VmCreateFormData>().control}
          name="common.proxyApplicant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代他提单</FormLabel>
              <FormControl>
                <UserSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="请选择代他提单"
                  className="w-[200px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={useFormContext<VmCreateFormData>().control}
          name="common.product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                隶属产品
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <ProjectSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="请选择隶属产品"
                  className="w-[200px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={useFormContext<VmCreateFormData>().control}
          name="common.expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                过期时间
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="w-[200px]">
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="选择过期时间"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

