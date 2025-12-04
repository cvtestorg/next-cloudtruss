import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "选择日期",
  disabled,
  className,
}: DatePickerProps) {
  // 计算日期范围：从现在到未来5年
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 5);
  maxDate.setMonth(11, 31); // 设置为5年后的12月31日

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }

    // 验证日期范围
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    // 不能选择过去的日期
    if (selectedDate < today) {
      return;
    }
    
    // 不能选择超过5年后的日期
    if (selectedDate > maxDate) {
      return;
    }

    // 只选择日期，时间设为当天的 00:00:00
    onChange(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            <span>{format(value, "yyyy-MM-dd")}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          fromDate={today}
          toDate={maxDate}
          captionLayout="dropdown"
          startMonth={today}
          endMonth={maxDate}
          defaultMonth={value || today}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

