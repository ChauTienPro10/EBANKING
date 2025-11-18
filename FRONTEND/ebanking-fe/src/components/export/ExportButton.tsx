import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface ExportButtonProps {
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
}

export function ExportButton({ onExportCSV, onExportExcel, onExportPDF }: ExportButtonProps) {
  return (
    <div className="flex gap-2">
      {onExportCSV && (
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          CSV
        </Button>
      )}
      {onExportExcel && (
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </Button>
      )}
      {onExportPDF && (
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button>
      )}
    </div>
  );
}







