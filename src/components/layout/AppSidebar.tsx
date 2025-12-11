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
      className="border-r border-sidebar-border transition-all duration-300 ease-in-out"
      collapsible="icon"
    >
      <SidebarHeader className={cn(
        "p-4 transition-all duration-300 ease-in-out",
        collapsed && "px-2 py-4"
      )}>
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300 ease-in-out",
          collapsed && "justify-center"
        )}>
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow shrink-0 transition-all duration-300 ease-in-out",
            collapsed ? "h-9 w-9" : "h-10 w-10"
          )}>
            <Building2 className={cn(
              "transition-all duration-300 ease-in-out",
              collapsed ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="font-display text-lg font-bold text-sidebar-primary-foreground whitespace-nowrap">
                ModernTech
              </h1>
              <p className="text-xs text-sidebar-foreground/60 whitespace-nowrap">HR Solutions</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn(
        "transition-all duration-300 ease-in-out",
        collapsed ? "px-1" : "px-3"
      )}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={cn(collapsed && "items-center")}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className={cn(
                    "transition-all duration-300 ease-in-out",
                    collapsed && "w-full flex justify-center"
                  )}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center rounded-lg text-sidebar-foreground transition-all duration-300 ease-in-out",
                          collapsed ? "justify-center w-9 h-9 p-0" : "gap-3 px-3 py-2.5 w-full",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
                          isActive && "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-all duration-300 ease-in-out",
                          isActive && "text-sidebar-primary"
                        )} />
                        {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn(
        "p-4 transition-all duration-300 ease-in-out",
        collapsed && "px-2 py-4"
      )}>
        <Separator className="mb-4 bg-sidebar-border" />
        
        {!collapsed && (
          <div className="mb-4 rounded-lg bg-sidebar-accent/50 p-3 animate-fade-in">
            <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
            <p className="font-medium text-sidebar-primary-foreground">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
          </div>
        )}

        <div className={cn(
          "flex gap-2 transition-all duration-300 ease-in-out",
          collapsed ? "flex-col items-center" : "items-center"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 ease-in-out hover:scale-110"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-300 ease-in-out hover:scale-110"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          {!collapsed && (
            <span className="text-sm text-sidebar-foreground ml-1 whitespace-nowrap animate-fade-in">Sign Out</span>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
