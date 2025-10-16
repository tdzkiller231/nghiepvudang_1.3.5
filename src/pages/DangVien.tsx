import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileDown, User } from "lucide-react";

export default function DangVien() {
  const members = [
    { id: 1, name: "Nguyễn Văn A", unit: "Chi bộ Kinh doanh", joinDate: "15/03/2024", status: "probationary", type: "Đảng viên dự bị" },
    { id: 2, name: "Trần Thị B", unit: "Chi bộ Sản xuất", joinDate: "20/01/2023", status: "official", type: "Đảng viên chính thức" },
    { id: 3, name: "Lê Văn C", unit: "Chi bộ Kỹ thuật", joinDate: "10/06/2024", status: "probationary", type: "Đảng viên dự bị" },
    { id: 4, name: "Phạm Thị D", unit: "Chi bộ Hành chính", joinDate: "05/11/2022", status: "official", type: "Đảng viên chính thức" },
    { id: 5, name: "Hoàng Văn E", unit: "Chi bộ CNTT", joinDate: "25/08/2023", status: "official", type: "Đảng viên chính thức" },
    { id: 6, name: "Đỗ Thị F", unit: "Chi bộ Kinh doanh", joinDate: "12/04/2024", status: "probationary", type: "Đảng viên dự bị" },
  ];

  const upcomingConversions = [
    { name: "Nguyễn Văn A", unit: "Chi bộ Kinh doanh", dueDate: "15/03/2025", daysLeft: 45 },
    { name: "Lê Văn C", unit: "Chi bộ Kỹ thuật", dueDate: "10/06/2025", daysLeft: 132 },
    { name: "Đỗ Thị F", unit: "Chi bộ Kinh doanh", dueDate: "12/04/2025", daysLeft: 73 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Đảng viên</h1>
          <p className="text-muted-foreground">Theo dõi đảng viên dự bị và chính thức</p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Xuất danh sách
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{members.length}</p>
            <p className="text-sm text-muted-foreground">Tổng số đảng viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-info" />
            </div>
            <p className="text-3xl font-bold text-info mb-1">
              {members.filter(m => m.status === 'probationary').length}
            </p>
            <p className="text-sm text-muted-foreground">Đảng viên dự bị</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-success mb-1">
              {members.filter(m => m.status === 'official').length}
            </p>
            <p className="text-sm text-muted-foreground">Đảng viên chính thức</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Danh sách đảng viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm đảng viên..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại đảng viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="probationary">Dự bị</SelectItem>
                  <SelectItem value="official">Chính thức</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Họ và tên</TableHead>
                    <TableHead className="font-semibold">Đơn vị</TableHead>
                    <TableHead className="font-semibold">Ngày kết nạp</TableHead>
                    <TableHead className="font-semibold">Loại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.unit}</TableCell>
                      <TableCell>{member.joinDate}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'official' ? 'default' : 'secondary'}>
                          {member.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Sắp chuyển chính thức</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingConversions.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.unit}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Hạn: {item.dueDate}</span>
                    <Badge variant={item.daysLeft < 60 ? 'destructive' : 'default'}>
                      {item.daysLeft} ngày
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
