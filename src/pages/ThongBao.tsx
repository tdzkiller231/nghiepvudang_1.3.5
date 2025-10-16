import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, AlertCircle, CheckCircle, Clock, FileText, Calendar, Users, ChevronRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: "urgent" | "info" | "deadline" | "document" | "meeting";
  title: string;
  description: string;
  time: string;
  unit: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  isRead: boolean;
  details: {
    fullDescription: string;
    dueDate?: string;
    relatedProfiles?: Array<{
      id: number;
      name: string;
      status: string;
      progress: number;
    }>;
    meetingInfo?: {
      date: string;
      time: string;
      location: string;
      participants: string[];
    };
    missingDocuments?: string[];
    actionRequired: string;
    link: string;
  };
}

export default function ThongBao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "urgent",
      title: "Hồ sơ Nguyễn Văn E sắp đến hạn xét kết nạp",
      description: "Hồ sơ cần được xét duyệt trước ngày 20/04/2025",
      time: "2 giờ trước",
      unit: "Chi bộ Kỹ thuật",
      icon: AlertCircle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
      isRead: false,
      details: {
        fullDescription: "Hồ sơ phát triển đảng của đồng chí Nguyễn Văn E đã đủ thời gian rèn luyện và hoàn thiện hồ sơ. Cần tổ chức họp Chi bộ để xét duyệt kết nạp trước ngày 20/04/2025.",
        dueDate: "20/04/2025",
        relatedProfiles: [
          { id: 1, name: "Nguyễn Văn E", status: "Chờ xét duyệt", progress: 90 },
        ],
        actionRequired: "Tổ chức họp Chi bộ, lấy phiếu biểu quyết, trình Đảng ủy phê duyệt",
        link: "/ho-so?id=1",
      },
    },
    {
      id: 2,
      type: "info",
      title: "Hoàn thành bước rèn luyện",
      description: "Trần Thị C đã hoàn thành giai đoạn rèn luyện",
      time: "5 giờ trước",
      unit: "Chi bộ Sản xuất",
      icon: CheckCircle,
      iconColor: "text-success",
      bgColor: "bg-success/10",
      isRead: false,
      details: {
        fullDescription: "Đồng chí Trần Thị C đã hoàn thành xuất sắc giai đoạn rèn luyện trong 12 tháng với kết quả đánh giá tốt từ Chi bộ và quần chúng.",
        dueDate: "15/04/2025",
        relatedProfiles: [
          { id: 2, name: "Trần Thị C", status: "Hoàn thành rèn luyện", progress: 70 },
        ],
        actionRequired: "Chuyển sang giai đoạn hoàn thiện hồ sơ kết nạp",
        link: "/ho-so?id=2",
      },
    },
    {
      id: 3,
      type: "deadline",
      title: "Đến hạn hoàn thiện hồ sơ",
      description: "3 hồ sơ cần hoàn thiện trong tuần này",
      time: "1 ngày trước",
      unit: "Chi bộ Kinh doanh",
      icon: Clock,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
      isRead: false,
      details: {
        fullDescription: "Có 3 hồ sơ phát triển đảng đang trong giai đoạn hoàn thiện hồ sơ, cần thu thập đầy đủ tài liệu trước ngày 22/04/2025.",
        dueDate: "22/04/2025",
        relatedProfiles: [
          { id: 3, name: "Lê Văn F", status: "Hoàn thiện hồ sơ", progress: 65 },
          { id: 4, name: "Phạm Thị G", status: "Hoàn thiện hồ sơ", progress: 55 },
          { id: 5, name: "Hoàng Văn H", status: "Hoàn thiện hồ sơ", progress: 60 },
        ],
        actionRequired: "Thu thập đầy đủ các giấy tờ: lý lịch, cam kết, nhận xét các tổ chức",
        link: "/ho-so?status=document_prep",
      },
    },
    {
      id: 4,
      type: "document",
      title: "Thiếu thông tin hồ sơ",
      description: "Hồ sơ Hoàng Văn I thiếu giấy tờ cam kết",
      time: "1 ngày trước",
      unit: "Chi bộ CNTT",
      icon: FileText,
      iconColor: "text-info",
      bgColor: "bg-info/10",
      isRead: true,
      details: {
        fullDescription: "Hồ sơ của đồng chí Hoàng Văn I đang thiếu một số tài liệu quan trọng. Cần bổ sung trước khi trình xét duyệt.",
        dueDate: "18/04/2025",
        relatedProfiles: [
          { id: 5, name: "Hoàng Văn I", status: "Thiếu tài liệu", progress: 55 },
        ],
        missingDocuments: [
          "Giấy cam kết rèn luyện (bản chính)",
          "Nhận xét của Công đoàn cơ sở",
          "Phiếu lấy ý kiến quần chúng (thiếu 5 phiếu)",
        ],
        actionRequired: "Liên hệ đồng chí bổ sung tài liệu thiếu",
        link: "/ho-so?id=5",
      },
    },
    {
      id: 5,
      type: "meeting",
      title: "Họp xét duyệt kết nạp",
      description: "Cuộc họp chi ủy sẽ diễn ra vào 25/04/2025",
      time: "2 ngày trước",
      unit: "Toàn Đảng bộ",
      icon: Calendar,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      isRead: true,
      details: {
        fullDescription: "Cuộc họp Chi ủy mở rộng để xét duyệt kết nạp đảng viên mới và đánh giá các hồ sơ phát triển đảng.",
        meetingInfo: {
          date: "25/04/2025",
          time: "14:00 - 17:00",
          location: "Phòng họp A - Tầng 3 - Tòa nhà BSR",
          participants: [
            "Ban Thường vụ Đảng ủy BSR",
            "Bí thư các Chi bộ trực thuộc",
            "Cán bộ Ban Tổ chức",
            "Đại diện Công đoàn, Đoàn TN",
          ],
        },
        relatedProfiles: [
          { id: 1, name: "Nguyễn Văn E", status: "Chờ xét duyệt", progress: 90 },
          { id: 6, name: "Đỗ Thị K", status: "Chờ xét duyệt", progress: 85 },
          { id: 7, name: "Vũ Văn L", status: "Chờ xét duyệt", progress: 95 },
        ],
        actionRequired: "Chuẩn bị hồ sơ đầy đủ, thông báo đến các đồng chí tham dự",
        link: "/chi-tieu",
      },
    },
  ]);

  // Calculate stats
  const stats = {
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.type === "urgent").length,
    processed: 45, // Mock data
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
  };

  // Mark as read
  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    toast({
      title: "Thành công",
      description: "Đã đánh dấu thông báo là đã đọc",
    });
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast({
      title: "Thành công",
      description: "Đã đánh dấu tất cả thông báo là đã đọc",
    });
  };

  // Navigate to related page
  const handleNavigate = (link: string) => {
    setIsDetailOpen(false);
    navigate(link);
  };

  // Handle view detail for tasks
  const handleViewTaskDetail = (type: string) => {
    switch(type) {
      case "approval":
        navigate("/ho-so?status=pending_approval");
        break;
      case "report":
        navigate("/bao-cao");
        break;
      case "update":
        navigate("/ho-so");
        break;
      default:
        navigate("/ho-so");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Thông báo & Nhắc nhở</h1>
        <p className="text-muted-foreground">Theo dõi các thông báo và công việc cần xử lý</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1 text-primary">{stats.unread}</p>
            <p className="text-sm text-muted-foreground">Chưa đọc</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1 text-destructive">{stats.urgent}</p>
            <p className="text-sm text-muted-foreground">Khẩn cấp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1 text-success">{stats.processed}</p>
            <p className="text-sm text-muted-foreground">Đã xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách thông báo</CardTitle>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Đánh dấu đã đọc tất cả
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-accent/20 border-l-4 border-l-primary" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.bgColor}`}>
                  <notification.icon className={`h-6 w-6 ${notification.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-foreground ${!notification.isRead ? "font-bold" : ""}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                      <Badge variant={notification.type === 'urgent' ? 'destructive' : 'secondary'} className="whitespace-nowrap">
                        {notification.type === 'urgent' ? 'Khẩn' :
                         notification.type === 'deadline' ? 'Hạn chót' :
                         notification.type === 'meeting' ? 'Họp' : 'Thông tin'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{notification.unit}</span>
                    <span>•</span>
                    <span>{notification.time}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Công việc cần xử lý trong tuần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-l-destructive bg-destructive/5 rounded">
              <div>
                <p className="font-medium text-foreground">Xét duyệt 5 hồ sơ kết nạp</p>
                <p className="text-sm text-muted-foreground">Hạn: 20/04/2025</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewTaskDetail("approval")}
                className="gap-2"
              >
                Xem chi tiết
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-l-warning bg-warning/5 rounded">
              <div>
                <p className="font-medium text-foreground">Tổng hợp báo cáo tháng 3</p>
                <p className="text-sm text-muted-foreground">Hạn: 22/04/2025</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewTaskDetail("report")}
                className="gap-2"
              >
                Xem chi tiết
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-l-info bg-info/5 rounded">
              <div>
                <p className="font-medium text-foreground">Cập nhật tiến độ 8 hồ sơ</p>
                <p className="text-sm text-muted-foreground">Hạn: 25/04/2025</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewTaskDetail("update")}
                className="gap-2"
              >
                Xem chi tiết
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedNotification && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedNotification.bgColor}`}>
                  <selectedNotification.icon className={`h-5 w-5 ${selectedNotification.iconColor}`} />
                </div>
              )}
              <div className="flex-1">
                <DialogTitle className="text-xl">{selectedNotification?.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedNotification?.unit} • {selectedNotification?.time}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6 py-4">
              {/* Full Description */}
              <div>
                <h4 className="font-semibold mb-2">Nội dung chi tiết</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedNotification.details.fullDescription}
                </p>
              </div>

              {/* Due Date */}
              {selectedNotification.details.dueDate && (
                <div>
                  <h4 className="font-semibold mb-2">Thời hạn</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-destructive">
                      {selectedNotification.details.dueDate}
                    </span>
                  </div>
                </div>
              )}

              {/* Meeting Info */}
              {selectedNotification.details.meetingInfo && (
                <div>
                  <h4 className="font-semibold mb-3">Thông tin cuộc họp</h4>
                  <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Ngày giờ</p>
                        <p className="text-muted-foreground">
                          {selectedNotification.details.meetingInfo.date} • {selectedNotification.details.meetingInfo.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Địa điểm</p>
                        <p className="text-muted-foreground">
                          {selectedNotification.details.meetingInfo.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium mb-1">Thành phần tham dự</p>
                        <ul className="text-muted-foreground space-y-1">
                          {selectedNotification.details.meetingInfo.participants.map((p, i) => (
                            <li key={i}>• {p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Profiles */}
              {selectedNotification.details.relatedProfiles && selectedNotification.details.relatedProfiles.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Hồ sơ liên quan ({selectedNotification.details.relatedProfiles.length})</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Tiến độ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedNotification.details.relatedProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{profile.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${profile.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground min-w-[40px]">
                                {profile.progress}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Missing Documents */}
              {selectedNotification.details.missingDocuments && selectedNotification.details.missingDocuments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-destructive">Tài liệu còn thiếu</h4>
                  <ul className="space-y-2">
                    {selectedNotification.details.missingDocuments.map((doc, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Required */}
              <div>
                <h4 className="font-semibold mb-2">Công việc cần làm</h4>
                <p className="text-sm bg-primary/10 p-3 rounded-lg border-l-4 border-l-primary">
                  {selectedNotification.details.actionRequired}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="flex gap-2">
              {selectedNotification && !selectedNotification.isRead && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setIsDetailOpen(false);
                  }}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
              {selectedNotification && (
                <Button 
                  onClick={() => handleNavigate(selectedNotification.details.link)}
                  className="gap-2"
                >
                  Đi đến xử lý
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}