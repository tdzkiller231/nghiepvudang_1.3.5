import { Home, Target, FileText, Bell, BarChart3, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Tổng quan", url: "/", icon: Home },
  { title: "Chỉ tiêu phát triển", url: "/chi-tieu", icon: Target },
  { title: "Hồ sơ phát triển", url: "/ho-so", icon: FileText },
  { title: "Quản lý đảng viên", url: "/dang-vien", icon: Users },
  { title: "Thông báo", url: "/thong-bao", icon: Bell },
  { title: "Báo cáo thống kê", url: "/bao-cao", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className="px-6 py-6">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">★</span>
              </div>
              <div>
                <h1 className="text-sidebar-foreground font-bold text-lg leading-tight">
                  Phát triển Đảng
                </h1>
                <p className="text-sidebar-foreground/80 text-xs">BSR</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-xl">★</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-6">
            {!isCollapsed && "Menu chính"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-6 py-3 transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
