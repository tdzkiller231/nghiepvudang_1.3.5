import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, FileCheck, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const recentActivities = [
    { id: 1, action: "Hoàn thành hồ sơ", person: "Nguyễn Văn A", unit: "Chi bộ Kinh doanh", time: "2 giờ trước", status: "success" },
    { id: 2, action: "Đăng ký chỉ tiêu mới", person: "Trần Thị B", unit: "Chi bộ Sản xuất", time: "3 giờ trước", status: "info" },
    { id: 3, action: "Cập nhật tiến độ", person: "Lê Văn C", unit: "Chi bộ Kỹ thuật", time: "5 giờ trước", status: "warning" },
    { id: 4, action: "Kết nạp đảng viên", person: "Phạm Thị D", unit: "Chi bộ Hành chính", time: "1 ngày trước", status: "success" },
  ];

  const upcomingTasks = [
    { id: 1, task: "Xét duyệt hồ sơ Nguyễn Văn E", deadline: "15/04/2025", priority: "high" },
    { id: 2, task: "Tổng hợp báo cáo quý 1", deadline: "20/04/2025", priority: "medium" },
    { id: 3, task: "Họp chi ủy về chỉ tiêu", deadline: "25/04/2025", priority: "low" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tổng quan</h1>
        <p className="text-muted-foreground">Tình hình công tác phát triển Đảng</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Quần chúng đang bồi dưỡng"
          value="124"
          icon={Users}
          trend="+12% so với tháng trước"
          trendUp
        />
        <StatCard
          title="Chỉ tiêu năm 2025"
          value="85"
          icon={Target}
          trend="Hoàn thành 68%"
          trendUp
        />
        <StatCard
          title="Hồ sơ chờ xét duyệt"
          value="18"
          icon={FileCheck}
          trend="Cần xử lý trong tuần"
          trendUp={false}
        />
        <StatCard
          title="Đã kết nạp năm nay"
          value="42"
          icon={TrendingUp}
          trend="+8 so với cùng kỳ"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-success' :
                    activity.status === 'warning' ? 'bg-warning' : 'bg-info'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.person} - {activity.unit}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Công việc sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">{task.task}</p>
                    <p className="text-sm text-muted-foreground">Hạn: {task.deadline}</p>
                  </div>
                  <Badge variant={
                    task.priority === 'high' ? 'destructive' :
                    task.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {task.priority === 'high' ? 'Khẩn' :
                     task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Unit */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ theo đơn vị</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { unit: "Chi bộ Kinh doanh", target: 20, completed: 15, rate: 75 },
              { unit: "Chi bộ Sản xuất", target: 25, completed: 18, rate: 72 },
              { unit: "Chi bộ Kỹ thuật", target: 15, completed: 12, rate: 80 },
              { unit: "Chi bộ Hành chính", target: 10, completed: 7, rate: 70 },
              { unit: "Chi bộ CNTT", target: 15, completed: 10, rate: 67 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{item.unit}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.completed}/{item.target} ({item.rate}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
