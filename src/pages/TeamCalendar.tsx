import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Calendar, Users, UserX, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeaveRequest } from '@/types';

// Nigerian public holidays for 2024-2025
const PUBLIC_HOLIDAYS = [
  { date: '2024-01-01', name: "New Year's Day" },
  { date: '2024-04-10', name: 'Eid el-Fitr' },
  { date: '2024-04-11', name: 'Eid el-Fitr Holiday' },
  { date: '2024-05-01', name: 'Workers Day' },
  { date: '2024-05-29', name: 'Democracy Day' },
  { date: '2024-06-12', name: 'Democracy Day' },
  { date: '2024-06-16', name: 'Eid el-Kabir' },
  { date: '2024-06-17', name: 'Eid el-Kabir Holiday' },
  { date: '2024-10-01', name: 'Independence Day' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: 'Boxing Day' },
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-31', name: 'Eid el-Fitr' },
  { date: '2025-04-01', name: 'Eid el-Fitr Holiday' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: 'Workers Day' },
  { date: '2025-06-06', name: 'Eid el-Kabir' },
  { date: '2025-06-07', name: 'Eid el-Kabir Holiday' },
  { date: '2025-06-12', name: 'Democracy Day' },
  { date: '2025-10-01', name: 'Independence Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' },
];

const TeamCalendar = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, getTeamMembers, employees } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'all' | 'team' | 'mine'>('mine');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  if (!currentUser) return null;

  const isTeamLead = currentUser.user_role === 'TeamLead';
  const isHROrAdmin = currentUser.user_role === 'HR' || currentUser.user_role === 'Admin';
  const isExec = currentUser.user_role === 'Exec';
  const canViewAllOrg = isHROrAdmin || isExec;

  // Get unique teams for team filter
  const uniqueTeams = [...new Set(employees.map(e => e.team).filter(Boolean))].sort();

  // Get approved/in-progress leaves only
  const approvedRequests = leaveRequests.filter(r =>
    r.status === 'approved' || r.status === 'pending_hr' || r.status === 'pending'
  );

  // Filter by view mode
  const filteredRequests = useMemo(() => {
    let filtered = approvedRequests;

    if (viewMode === 'mine') {
      return filtered.filter(r => r.email === currentUser.email);
    } else if (viewMode === 'team') {
      if (canViewAllOrg && selectedTeam !== 'all') {
        // HR/Exec filtering by specific team
        const teamEmployees = employees.filter(e => e.team === selectedTeam);
        const teamEmails = teamEmployees.map(e => e.email);
        return filtered.filter(r => teamEmails.includes(r.email));
      } else if (isTeamLead) {
        // Team lead sees their team
        const teamMembers = getTeamMembers(currentUser.email);
        const teamEmails = teamMembers.map(m => m.email);
        return filtered.filter(r => teamEmails.includes(r.email) || r.email === currentUser.email);
      }
    }
    // 'all' view - return all for HR/Exec/Admin
    return filtered;
  }, [approvedRequests, viewMode, currentUser, isTeamLead, canViewAllOrg, selectedTeam, employees]);

  // Get holidays for current month
  const currentMonthHolidays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return PUBLIC_HOLIDAYS.filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.getFullYear() === year && holidayDate.getMonth() === month;
    });
  }, [currentDate]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isPublicHoliday = (day: number) => {
    const checkDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return PUBLIC_HOLIDAYS.some(h => h.date === checkDateStr);
  };

  const getHolidayName = (day: number) => {
    const checkDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = PUBLIC_HOLIDAYS.find(h => h.date === checkDateStr);
    return holiday?.name || '';
  };

  const getLeaveRequestsForDay = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const checkDateStr = checkDate.toISOString().split('T')[0];

    return filteredRequests.filter(request => {
      return request.start_date <= checkDateStr && request.end_date >= checkDateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const isWeekend = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Unique employees for legend
  const uniqueEmployees = useMemo(() => {
    const emailSet = new Set(filteredRequests.map(r => r.email));
    return Array.from(emailSet);
  }, [filteredRequests]);

  const getEmployeeColor = (email: string) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-amber-500',
      'bg-teal-500',
      'bg-rose-500',
    ];
    const index = uniqueEmployees.indexOf(email);
    return colors[index % colors.length];
  };

  const getEmployee = (email: string) => {
    return employees.find(e => e.email === email);
  };

  // Stats calculation
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const onLeaveToday = approvedRequests.filter(r =>
    r.status === 'approved' && r.start_date <= todayStr && r.end_date >= todayStr
  );

  // Total leave days this month
  const thisMonthStart = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
  const thisMonthEnd = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${daysInMonth}`;
  const thisMonthRequests = filteredRequests.filter(r =>
    (r.start_date <= thisMonthEnd && r.end_date >= thisMonthStart)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View team leave schedules and public holidays
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Label className="text-xs">View</Label>
            <Select value={viewMode} onValueChange={(value: 'all' | 'team' | 'mine') => {
              setViewMode(value);
              if (value !== 'team') setSelectedTeam('all');
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My Leave Only</SelectItem>
                {(canViewAllOrg || isTeamLead) && <SelectItem value="team">Leaves per Team</SelectItem>}
                {canViewAllOrg && <SelectItem value="all">All Organisation</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          {/* Team selector for HR/CEO when viewing by team */}
          {canViewAllOrg && viewMode === 'team' && (
            <div className="space-y-1">
              <Label className="text-xs">Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {uniqueTeams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{onLeaveToday.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Public Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{currentMonthHolidays.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{thisMonthRequests.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requests this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">People on Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{uniqueEmployees.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{monthName}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div
                key={day}
                className={`text-center font-semibold text-sm py-2 ${
                  idx === 0 || idx === 6 ? 'text-muted-foreground' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[100px]" />;
              }

              const isHoliday = isPublicHoliday(day);
              const holidayName = getHolidayName(day);
              const dayLeaves = getLeaveRequestsForDay(day);
              const today = isToday(day);
              const weekend = isWeekend(day);

              return (
                <div
                  key={day}
                  className={`
                    min-h-[100px] border rounded-lg p-1.5 relative overflow-hidden
                    ${today ? 'border-primary border-2 bg-primary/5' : 'border-border'}
                    ${isHoliday ? 'bg-green-50' : weekend ? 'bg-muted/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${today ? 'text-primary' : weekend ? 'text-muted-foreground' : ''}`}>
                      {day}
                    </span>
                    {today && (
                      <Badge variant="default" className="text-[10px] px-1 py-0 h-4">Today</Badge>
                    )}
                  </div>

                  {isHoliday && (
                    <div className="text-[10px] font-medium text-green-700 truncate mb-1 bg-green-100 px-1 rounded">
                      {holidayName}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {dayLeaves.slice(0, 3).map((request, idx) => (
                      <div
                        key={idx}
                        className={`
                          ${getEmployeeColor(request.email)}
                          text-white text-[10px] px-1 py-0.5 rounded truncate
                          ${request.status !== 'approved' ? 'opacity-60' : ''}
                        `}
                        title={`${request.full_name} - ${request.leave_type} (${request.status})`}
                      >
                        {request.full_name.split(' ')[0]}
                      </div>
                    ))}
                    {dayLeaves.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{dayLeaves.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend & Upcoming */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Calendar Indicators</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary bg-primary/5 rounded" />
                    <span className="text-sm">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
                    <span className="text-sm">Public Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted/30 border border-border rounded" />
                    <span className="text-sm">Weekend</span>
                  </div>
                </div>
              </div>

              {uniqueEmployees.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">People ({uniqueEmployees.length})</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {uniqueEmployees.map(email => {
                      const emp = getEmployee(email);
                      return (
                        <div key={email} className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${getEmployeeColor(email)} rounded`} />
                          <span className="text-sm truncate">{emp?.full_name || email}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* On Leave Today */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">On Leave Today</CardTitle>
            <CardDescription>Currently away from work</CardDescription>
          </CardHeader>
          <CardContent>
            {onLeaveToday.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Everyone is available today
              </p>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {onLeaveToday.map(request => {
                  const emp = getEmployee(request.email);
                  return (
                    <div key={request.request_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${request.full_name}`} />
                          <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{request.full_name}</p>
                          <p className="text-xs text-muted-foreground">{emp?.team || request.email}</p>
                        </div>
                      </div>
                      <Badge variant={request.leave_type === 'sick' ? 'destructive' : 'default'} className="capitalize">
                        {request.leave_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* This Month's Holidays */}
      {currentMonthHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Public Holidays This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {currentMonthHolidays.map(holiday => (
                <div key={holiday.date} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{holiday.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(holiday.date).toLocaleDateString('en-GB', { weekday: 'long' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamCalendar;
