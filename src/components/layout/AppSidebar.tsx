import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  LogOut,
  Building2,
  Moon,
  Sun
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Employees', url: '/employees', icon: Users },
  { title: 'Attendance & Leave', url: '/attendance', icon: Calendar },
  { title: 'Payroll', url: '/payroll', icon: DollarSign },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar 
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          collapsed && "justify-center"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display text-lg font-bold text-sidebar-primary-foreground">
                ModernTech
              </h1>
              <p className="text-xs text-sidebar-foreground/60">HR Solutions</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive && "text-sidebar-primary"
                        )} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-4 bg-sidebar-border" />
        
        {!collapsed && (
          <div className="mb-4 rounded-lg bg-sidebar-accent/50 p-3 animate-fade-in">
            <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
            <p className="font-medium text-sidebar-primary-foreground">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
          </div>
        )}

        <div className={cn(
          "flex gap-2",
          collapsed ? "flex-col items-center" : "items-center"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={logout}
            className={cn(
              "text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive",
              !collapsed && "flex-1 justify-start"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
