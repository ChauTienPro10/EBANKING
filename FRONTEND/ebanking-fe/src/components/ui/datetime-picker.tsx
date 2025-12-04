import * as React from "react";
import { Input } from "@/components/ui/input";

export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  min,
  max,
  className,
}: DateTimePickerProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <Input
      type="datetime-local"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      className={className}
    />
  );
}


