import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import {
  Home,
  Calendar,
  FileText,
  Users,
  Settings,
  TrendingUp,
  Clock,
  CheckSquare,
  CalendarDays,
  UserCog,
  Shield,
  CalendarCheck,
  HelpCircle,
  Sparkles,
  BarChart3,
  Building2,
  Crown,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { currentUser } = useAuth();

  const employeeNav = [
    { title: 'Dashboard', url: '/', icon: Home },
    { title: 'Request Leave', url: '/leave/request', icon: Calendar },
    { title: 'Leave History', url: '/leave/history', icon: Clock },
    { title: 'Handovers', url: '/handovers', icon: FileText },
    { title: 'AI Catchup', url: '/catchup', icon: Sparkles },
  ];

  const teamLeadNav = [
    { title: 'Team Requests', url: '/team/requests', icon: Users },
    { title: 'Pending Approvals', url: '/team/approvals', icon: CheckSquare },
    { title: 'Team Calendar', url: '/team/calendar', icon: CalendarDays },
    { title: 'Capacity Insights', url: '/capacity', icon: TrendingUp },
  ];

  const hrNav = [
    { title: 'All Requests', url: '/hr/requests', icon: FileText },
    { title: 'Queries', url: '/hr/queries', icon: HelpCircle },
    { title: 'Capacity Insights', url: '/capacity', icon: TrendingUp },
  ];

  const adminNav = [
    { title: 'Employees', url: '/admin/employees', icon: UserCog },
    { title: 'Leave Policies', url: '/admin/policies', icon: Shield },
    { title: 'Public Holidays', url: '/admin/holidays', icon: CalendarCheck },
  ];

  const execNav = [
    { title: 'Exec Dashboard', url: '/exec', icon: Crown },
    { title: 'Org Health', url: '/exec/health', icon: Activity },
    { title: 'AI Briefing', url: '/exec/briefing', icon: Sparkles },
    { title: 'All Departments', url: '/capacity', icon: Building2 },
  ];

  const isTeamLead = currentUser?.user_role === 'TeamLead';
  const isHR = currentUser?.user_role === 'HR' || currentUser?.user_role === 'Admin';
  const isExec = currentUser?.user_role === 'Exec';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">NeverLeft</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden">
          Leave Management
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {employeeNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isTeamLead && (
          <SidebarGroup>
            <SidebarGroupLabel>Team Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {teamLeadNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isHR && (
          <SidebarGroup>
            <SidebarGroupLabel>HR Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hrNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isHR && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isExec && (
          <SidebarGroup>
            <SidebarGroupLabel>Executive</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {execNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className="hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
