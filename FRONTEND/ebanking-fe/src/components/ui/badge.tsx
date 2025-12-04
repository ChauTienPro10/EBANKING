import { cn } from "@/lib/utils";
import * as React from "react";

type Variant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-white",
    outline: "border border-input",
    success: "bg-green-600 text-white",
    warning: "bg-amber-500 text-white",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}











