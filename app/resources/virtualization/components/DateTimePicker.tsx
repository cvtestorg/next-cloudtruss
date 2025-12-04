import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "选择日期和时间",
  disabled,
}: DateTimePickerProps) {
  const [timeValue, setTimeValue] = useState(
    value ? format(value, "HH:mm") : ""
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      setTimeValue("");
      return;
    }

    // 如果已选择时间，合并日期和时间
    if (timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    } else {
      // 只选择日期，时间设为当前时间
      const newDate = new Date(date);
      const now = new Date();
      newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
      onChange(newDate);
      setTimeValue(format(newDate, "HH:mm"));
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (value && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            <span>{format(value, "yyyy-MM-dd HH:mm")}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex items-center gap-2 border-t pt-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-32"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

