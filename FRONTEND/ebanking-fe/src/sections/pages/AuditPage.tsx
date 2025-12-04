import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export function AuditPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Thời gian</TH>
                <TH>Nhân viên</TH>
                <TH>IP</TH>
                <TH>Thiết bị</TH>
                <TH>Hành động</TH>
              </TR>
            </THead>
            <TBody>
              {[
                { time: "10:12", user: "admin", ip: "1.1.1.1", device: "Chrome", action: "Khóa tài khoản #123" },
                { time: "10:18", user: "manager", ip: "2.2.2.2", device: "Edge", action: "Phê duyệt giao dịch TX1001" },
              ].map((a, idx) => (
                <TR key={idx}>
                  <TD>{a.time}</TD>
                  <TD className="font-medium">{a.user}</TD>
                  <TD>{a.ip}</TD>
                  <TD>{a.device}</TD>
                  <TD>{a.action}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}











