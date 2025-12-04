import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "pending" | "failed" | "active" | "inactive" | "locked" | "verified" | "rejected";
  label?: string;
}

const statusConfig = {
  success: { variant: "success" as const, icon: CheckCircle, defaultLabel: "Success" },
  pending: { variant: "warning" as const, icon: Clock, defaultLabel: "Pending" },
  failed: { variant: "destructive" as const, icon: XCircle, defaultLabel: "Failed" },
  active: { variant: "success" as const, icon: CheckCircle, defaultLabel: "Active" },
  inactive: { variant: "outline" as const, icon: Clock, defaultLabel: "Inactive" },
  locked: { variant: "destructive" as const, icon: XCircle, defaultLabel: "Locked" },
  verified: { variant: "success" as const, icon: CheckCircle, defaultLabel: "Verified" },
  rejected: { variant: "destructive" as const, icon: XCircle, defaultLabel: "Rejected" },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  // Fallback to default if status is not recognized
  if (!config) {
    console.warn(`StatusBadge: Unknown status "${status}". Falling back to "pending".`);
    const defaultConfig = statusConfig.pending;
    const DefaultIcon = defaultConfig.icon;
    return (
      <Badge variant={defaultConfig.variant} className="gap-1">
        <DefaultIcon className="h-3 w-3" />
        {label || status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label || config.defaultLabel}
    </Badge>
  );
}

