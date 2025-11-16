import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}










