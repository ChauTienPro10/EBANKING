import * as React from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string } & Omit<
  React.OptionHTMLAttributes<HTMLOptionElement>,
  "value" | "label"
>;

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Option[];
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {options
          ? options.map(({ value, label, ...optionProps }) => (
              <option key={value} value={value} {...optionProps}>
                {label}
              </option>
            ))
          : children}
      </select>
    );
  }
);
Select.displayName = "Select";







