import { partyMemberService } from './partyMemberService';

interface Notification {
  id: number;
  type: "urgent" | "info" | "deadline";
  title: string;
  description: string;
  time: string;
  memberId?: number;
  link: string;
}

class NotificationService {
  checkProbationDeadlines(): Notification[] {
    const members = partyMemberService.getAllMembers();
    const notifications: Notification[] = [];

    members.forEach(member => {
      if (partyMemberService.checkProbationDeadline(member)) {
        notifications.push({
          id: Date.now() + member.id,
          type: "deadline",
          title: `Đảng viên ${member.name} sắp hết hạn dự bị`,
          description: `Cần xét chuyển đảng viên chính thức trước ngày ${member.probationEndDate}`,
          time: "Hôm nay",
          memberId: member.id,
          link: `/dang-vien?id=${member.id}`,
        });
      }
    });

    return notifications;
  }

  saveNotifications(notifications: Notification[]): void {
    const existing = this.getNotifications();
    const merged = [...existing, ...notifications];
    localStorage.setItem('notifications', JSON.stringify(merged));
  }

  getNotifications(): Notification[] {
    const data = localStorage.getItem('notifications');
    return data ? JSON.parse(data) : [];
  }
}

export const notificationService = new NotificationService();