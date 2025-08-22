import { 
  BarChart3, 
  Users, 
  Package, 
  MessageSquare, 
  Shield, 
  Settings,
  Home,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Vendors", url: "/vendors", icon: Users },
  { title: "Products", url: "/products", icon: Package },
  { title: "Support", url: "/support", icon: MessageSquare },
  { title: "Security", url: "/security", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

const quickStats = [
  { label: "Active Vendors", value: "1,247", trend: "+12%", color: "text-success" },
  { label: "Pending Reviews", value: "34", trend: "urgent", color: "text-warning" },
  { label: "Revenue Today", value: "£8,490", trend: "+8%", color: "text-primary" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} border-r bg-card`} collapsible="icon">
      <SidebarContent className="p-4">
        {/* Logo */}
        <div className="mb-8">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-dashboard-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AC</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Afri-Connect</h2>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-dashboard-accent rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">AC</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats - Only show when expanded */}
        {!collapsed && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <span className={`text-xs ${stat.color} font-medium`}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}