import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown, LogOut, Settings, Users, Shield, UserCircle, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DEMO_ACCOUNTS } from '@/lib/mockData';

export const AppHeader = () => {
  const { currentUser, logout, loginAs } = useAuth();
  const { getUnreadCount } = useData();
  const navigate = useNavigate();

  const unreadNotifications = currentUser ? getUnreadCount(currentUser.email) : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchUser = (role: 'employee' | 'teamLead' | 'hr' | 'exec') => {
    loginAs(role);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-lg font-semibold">NeverLeft</h1>
            <p className="text-xs text-muted-foreground">Leave Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <Badge variant="outline" className="hidden md:flex">
            {currentUser?.user_role}
          </Badge>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/personas/svg?seed=${currentUser?.full_name}`}
                    alt={currentUser?.full_name}
                  />
                  <AvatarFallback>
                    {currentUser?.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{currentUser?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                  <Badge variant="outline" className="w-fit mt-1 text-xs">{currentUser?.team}</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/catchup')}>
                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                NeverLeft AI Catchup
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Switch Account
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleSwitchUser('employee')}
                    className={currentUser?.email === DEMO_ACCOUNTS.employee.email ? 'bg-accent' : ''}
                  >
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                      <span>{DEMO_ACCOUNTS.employee.full_name}</span>
                      <span className="text-xs text-muted-foreground">Employee</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSwitchUser('teamLead')}
                    className={currentUser?.email === DEMO_ACCOUNTS.teamLead.email ? 'bg-accent' : ''}
                  >
                    <Users className="mr-2 h-4 w-4 text-purple-500" />
                    <div className="flex flex-col">
                      <span>{DEMO_ACCOUNTS.teamLead.full_name}</span>
                      <span className="text-xs text-muted-foreground">Team Lead</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSwitchUser('hr')}
                    className={currentUser?.email === DEMO_ACCOUNTS.hr.email ? 'bg-accent' : ''}
                  >
                    <Shield className="mr-2 h-4 w-4 text-green-500" />
                    <div className="flex flex-col">
                      <span>{DEMO_ACCOUNTS.hr.full_name}</span>
                      <span className="text-xs text-muted-foreground">HR Admin</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSwitchUser('exec')}
                    className={currentUser?.email === DEMO_ACCOUNTS.exec.email ? 'bg-accent' : ''}
                  >
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    <div className="flex flex-col">
                      <span>{DEMO_ACCOUNTS.exec.full_name}</span>
                      <span className="text-xs text-muted-foreground">CEO</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
