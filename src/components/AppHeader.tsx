import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown, LogOut, Settings, Users, Shield, UserCircle, Sparkles, Crown, Check, CheckCheck, Calendar, FileText, MessageSquare, AlertCircle } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'approval':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'rejection':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'query':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'query_response':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'handover':
      return <FileText className="h-4 w-4 text-purple-500" />;
    case 'reminder':
      return <Bell className="h-4 w-4 text-orange-500" />;
    case 'catchup':
      return <Sparkles className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const AppHeader = () => {
  const { currentUser, logout, loginAs } = useAuth();
  const { getUnreadCount, getMyNotifications, markAsRead, markAllAsRead } = useData();
  const navigate = useNavigate();

  const unreadNotifications = currentUser ? getUnreadCount(currentUser.email) : 0;
  const myNotifications = currentUser ? getMyNotifications(currentUser.email) : [];

  const handleNotificationClick = (notificationId: string, actionUrl: string | null) => {
    markAsRead(notificationId);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllAsRead(currentUser.email);
    }
  };

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
          <Popover>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                {unreadNotifications > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {myNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {myNotifications.slice(0, 20).map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 cursor-pointer hover:bg-accent transition-colors ${
                          !notification.read ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${currentUser?.full_name}`}
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
                      <span className="text-xs text-muted-foreground">Analyst</span>
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
