import { useAuth } from '@/contexts/AuthContext';
import { DEMO_USERS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const UserSwitcher = () => {
  const { currentUser, setCurrentUser } = useAuth();

  const handleSwitchUser = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'HR':
        return 'bg-demo-light text-demo';
      case 'Manager':
        return 'bg-warning-light text-warning';
      case 'Employee':
        return 'bg-primary-light text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden md:inline">Switch User</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Switch to User Perspective</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEMO_USERS.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleSwitchUser(user.id)}
            className={currentUser?.id === user.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {currentUser?.id === user.id && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                    {user.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">{user.department}</span>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
