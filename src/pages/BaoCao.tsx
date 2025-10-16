import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Send, TrendingUp, Users, Target, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function BaoCao() {
  const monthlyData = [
    { month: "T1", boiDuong: 15, ketNap: 8, chiTieu: 20 },
    { month: "T2", boiDuong: 18, ketNap: 10, chiTieu: 20 },
    { month: "T3", boiDuong: 22, ketNap: 12, chiTieu: 20 },
    { month: "T4", boiDuong: 20, ketNap: 14, chiTieu: 20 },
  ];

  const unitPerformance = [
    { unit: "Kinh doanh", completed: 75, target: 100 },
    { unit: "Sản xuất", completed: 68, target: 100 },
    { unit: "Kỹ thuật", completed: 82, target: 100 },
    { unit: "Hành chính", completed: 71, target: 100 },
    { unit: "CNTT", completed: 65, target: 100 },
  ];

  const summaryStats = [
    { label: "Quần chúng đang bồi dưỡng", value: "124", icon: Users, color: "bg-info/10 text-info" },
    { label: "Đã kết nạp năm nay", value: "42", icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Chỉ tiêu năm 2025", value: "85", icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Tỷ lệ hoàn thành", value: "73%", icon: TrendingUp, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground">Phân tích và báo cáo công tác phát triển Đảng</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Gửi cấp ủy
          </Button>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" />
            Kết xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Select defaultValue="2025">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">Năm 2023</SelectItem>
                <SelectItem value="2024">Năm 2024</SelectItem>
                <SelectItem value="2025">Năm 2025</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                <SelectItem value="kinhdoanh">Chi bộ Kinh doanh</SelectItem>
                <SelectItem value="sanxuat">Chi bộ Sản xuất</SelectItem>
                <SelectItem value="kythuat">Chi bộ Kỹ thuật</SelectItem>
                <SelectItem value="hanhchinh">Chi bộ Hành chính</SelectItem>
                <SelectItem value="cntt">Chi bộ CNTT</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="month">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Chu kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Theo tháng</SelectItem>
                <SelectItem value="quarter">Theo quý</SelectItem>
                <SelectItem value="year">Theo năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="boiDuong" stroke="#3b82f6" name="Bồi dưỡng" strokeWidth={2} />
                <Line type="monotone" dataKey="ketNap" stroke="#10b981" name="Kết nạp" strokeWidth={2} />
                <Line type="monotone" dataKey="chiTieu" stroke="#ef4444" name="Chỉ tiêu" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Unit Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ hoàn thành theo đơn vị</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unitPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="unit" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#ef4444" name="Hoàn thành (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo chi tiết theo đơn vị</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Đơn vị</th>
                  <th className="text-center p-3 font-semibold">Đang bồi dưỡng</th>
                  <th className="text-center p-3 font-semibold">Chờ xét duyệt</th>
                  <th className="text-center p-3 font-semibold">Đã kết nạp</th>
                  <th className="text-center p-3 font-semibold">Chỉ tiêu</th>
                  <th className="text-center p-3 font-semibold">Hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { unit: "Chi bộ Kinh doanh", training: 25, pending: 5, joined: 15, target: 20, rate: 75 },
                  { unit: "Chi bộ Sản xuất", training: 30, pending: 6, joined: 18, target: 25, rate: 72 },
                  { unit: "Chi bộ Kỹ thuật", training: 22, pending: 4, joined: 12, target: 15, rate: 80 },
                  { unit: "Chi bộ Hành chính", training: 18, pending: 3, joined: 7, target: 10, rate: 70 },
                  { unit: "Chi bộ CNTT", training: 20, pending: 4, joined: 10, target: 15, rate: 67 },
                ].map((row, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium">{row.unit}</td>
                    <td className="p-3 text-center">{row.training}</td>
                    <td className="p-3 text-center">{row.pending}</td>
                    <td className="p-3 text-center font-semibold text-success">{row.joined}</td>
                    <td className="p-3 text-center">{row.target}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        row.rate >= 75 ? 'bg-success/10 text-success' :
                        row.rate >= 60 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
