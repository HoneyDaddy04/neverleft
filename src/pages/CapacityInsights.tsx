import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserCheck, UserX, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

const CapacityInsights = () => {
  const { currentUser } = useAuth();
  const { employees, leaveRequests, getTeamMembers } = useData();

  const isHROrAdmin = currentUser?.user_role === 'HR' || currentUser?.user_role === 'Admin';
  const isExec = currentUser?.user_role === 'Exec';
  const isTeamLead = currentUser?.user_role === 'TeamLead';
  const isEmployee = currentUser?.user_role === 'Employee';

  // Get relevant employees based on role
  const relevantEmployees = isHROrAdmin || isExec
    ? employees
    : isTeamLead
    ? getTeamMembers(currentUser?.email || '')
    : employees.filter(e => e.team === currentUser?.team); // Employees see their own team

  // Calculate who's on leave today
  const today = new Date().toISOString().split('T')[0];
  const onLeaveToday = leaveRequests.filter(r => {
    if (r.status !== 'approved') return false;
    const isInRange = r.start_date <= today && r.end_date >= today;
    if (isHROrAdmin || isExec) return isInRange;
    if (isTeamLead) return isInRange && r.tl_email === currentUser?.email;
    // Employees see their team members on leave
    const emp = employees.find(e => e.email === r.email);
    return isInRange && emp?.team === currentUser?.team;
  });

  // Calculate upcoming leaves (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const futureDate = thirtyDaysFromNow.toISOString().split('T')[0];

  const upcomingLeaves = leaveRequests.filter(r => {
    if (r.status !== 'approved' && r.status !== 'pending' && r.status !== 'pending_hr') return false;
    if (r.start_date < today) return false;
    if (r.start_date > futureDate) return false;
    if (isHROrAdmin || isExec) return true;
    if (isTeamLead) return r.tl_email === currentUser?.email;
    // Employees see their team members' upcoming leaves (approved only for privacy)
    if (r.status !== 'approved') return false;
    const emp = employees.find(e => e.email === r.email);
    return emp?.team === currentUser?.team;
  });

  // Calculate capacity percentage
  const totalTeamSize = relevantEmployees.length;
  const onLeaveCount = onLeaveToday.length;
  const capacityPercentage = totalTeamSize > 0
    ? Math.round(((totalTeamSize - onLeaveCount) / totalTeamSize) * 100)
    : 100;

  // Group by team for org-wide view
  const teamStats = (isHROrAdmin || isExec)
    ? employees.reduce((acc, emp) => {
        const team = emp.team || 'Unassigned';
        if (!acc[team]) {
          acc[team] = { total: 0, onLeave: 0 };
        }
        acc[team].total++;
        const isOnLeave = onLeaveToday.some(r => r.email === emp.email);
        if (isOnLeave) acc[team].onLeave++;
        return acc;
      }, {} as Record<string, { total: number; onLeave: number }>)
    : {};

  // Low balance alerts
  const lowBalanceEmployees = relevantEmployees.filter(emp =>
    emp.annual_balance <= 3 || emp.sick_balance <= 2
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEmployee ? 'Team Availability' : 'Capacity Insights'}
        </h1>
        <p className="text-muted-foreground">
          {isHROrAdmin || isExec ? 'Organization-wide' : 'Team'} capacity and availability overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {isHROrAdmin || isExec ? 'Employees' : 'Team Members'}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeamSize}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalTeamSize - onLeaveCount}</div>
            <p className="text-xs text-muted-foreground">Working today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{onLeaveCount}</div>
            <p className="text-xs text-muted-foreground">Currently away</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacityPercentage}%</div>
            <Progress value={capacityPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* On Leave Today */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              On Leave Today
            </CardTitle>
            <CardDescription>Team members currently away</CardDescription>
          </CardHeader>
          <CardContent>
            {onLeaveToday.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Everyone is available today
              </p>
            ) : (
              <div className="space-y-3">
                {onLeaveToday.map(request => (
                  <div key={request.request_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${request.full_name}`} />
                        <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Returns {new Date(request.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={request.leave_type === 'sick' ? 'destructive' : 'default'}>
                      {request.leave_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Leaves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Leaves (30 days)
            </CardTitle>
            <CardDescription>Scheduled and pending leaves</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLeaves.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming leaves scheduled
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {upcomingLeaves.slice(0, 10).map(request => (
                  <div key={request.request_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${request.full_name}`} />
                        <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' - '}
                          {new Date(request.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                      {request.status === 'approved' ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Breakdown (HR/Exec only) */}
      {(isHROrAdmin || isExec) && Object.keys(teamStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Capacity Breakdown</CardTitle>
            <CardDescription>Current availability by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(teamStats).map(([team, stats]) => {
                const teamCapacity = Math.round(((stats.total - stats.onLeave) / stats.total) * 100);
                return (
                  <div key={team} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{team}</h4>
                      <Badge variant={teamCapacity < 70 ? 'destructive' : 'default'}>
                        {teamCapacity}%
                      </Badge>
                    </div>
                    <Progress value={teamCapacity} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {stats.total - stats.onLeave} of {stats.total} available
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Balance Alerts (not shown to regular employees) */}
      {lowBalanceEmployees.length > 0 && (isHROrAdmin || isExec || isTeamLead) && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Low Balance Alerts
            </CardTitle>
            <CardDescription>Team members with limited leave remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowBalanceEmployees.map(emp => (
                <div key={emp.email} className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={emp.profile_image} />
                      <AvatarFallback>{emp.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{emp.full_name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {emp.annual_balance <= 3 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Annual: {emp.annual_balance} days
                      </Badge>
                    )}
                    {emp.sick_balance <= 2 && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        Sick: {emp.sick_balance} days
                      </Badge>
                    )}
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

export default CapacityInsights;
