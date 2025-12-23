import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "select" | "password";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  helperText?: string;
}

interface CRUDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

export function CRUDModal({
  open,
  onOpenChange,
  title,
  fields,
  initialData,
  onSubmit,
  loading = false,
}: CRUDModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState<Record<string, unknown>>(
    initialData || {}
  );

  React.useEffect(() => {
    if (open) {
      setFormData(initialData || {});
    }
  }, [open, initialData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Parent component handles modal closing and state management
  };

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {field.type === "select" ? (
                <Select
                  value={String(formData[field.name] || "")}
                  onValueChange={(value) => handleChange(field.name, value)}
                  required={field.required}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <Input
                    id={field.name}
                    type={field.type || "text"}
                    value={String(formData[field.name] || "")}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                  />
                  {field.helperText && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.helperText}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("common.saving")
                : initialData
                  ? t("common.update")
                  : t("common.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
