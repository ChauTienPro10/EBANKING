import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ReportsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input placeholder="Kỳ: ngày/tháng/năm" />
          <Input type="date" placeholder="Từ ngày" />
          <Input type="date" placeholder="Đến ngày" />
          <Button className="md:col-span-1">Tạo báo cáo</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Kết quả</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button variant="outline">Export Excel</Button>
          <Button variant="outline">Export PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}











