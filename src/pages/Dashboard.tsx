import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/mockData';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const {
    employees,
    getMyRequests,
    getPendingTLApprovals,
    getPendingHRApprovals,
    getMyNotifications,
    getUnreadCount,
    getOnLeaveToday,
    getTeamMembers,
    getAssignedToMe,
  } = useData();

  if (!currentUser) return null;

  const myRequests = getMyRequests(currentUser.email);
  const myNotifications = getMyNotifications(currentUser.email);
  const unreadCount = getUnreadCount(currentUser.email);
  const assignedTasks = getAssignedToMe(currentUser.email);

  // Role-specific data
  const isTeamLead = currentUser.user_role === 'TeamLead';
  const isHR = currentUser.user_role === 'HR' || currentUser.user_role === 'Admin';
  const isExec = currentUser.user_role === 'Exec';
  const pendingTLApprovals = isTeamLead ? getPendingTLApprovals(currentUser.email) : [];
  const pendingHRApprovals = isHR ? getPendingHRApprovals() : [];
  const teamMembers = isTeamLead ? getTeamMembers(currentUser.email) : [];
  const onLeaveToday = getOnLeaveToday();

  // Find next upcoming leave
  const today = new Date().toISOString().split('T')[0];
  const nextLeave = myRequests
    .filter(r => r.status === 'approved' && r.start_date > today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

  // Pending handover tasks
  const pendingTasks = assignedTasks.filter(t => t.status === 'pending' || t.status === 'acknowledged');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {currentUser.full_name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentUser.role} · {currentUser.team}
          </p>
        </div>
        <Link to="/leave/request">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        </Link>
      </div>

      {/* Role-specific alerts */}
      {(pendingTLApprovals.length > 0 || pendingHRApprovals.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">
                    {isTeamLead && pendingTLApprovals.length > 0 && (
                      <>{pendingTLApprovals.length} leave request{pendingTLApprovals.length > 1 ? 's' : ''} awaiting your approval</>
                    )}
                    {isHR && pendingHRApprovals.length > 0 && (
                      <>{pendingHRApprovals.length} leave request{pendingHRApprovals.length > 1 ? 's' : ''} awaiting HR approval</>
                    )}
                  </p>
                </div>
              </div>
              <Link to={isHR ? '/hr/requests' : '/team/approvals'}>
                <Button variant="outline" size="sm" className="text-orange-700 border-orange-300">
                  Review Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Leave Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Annual Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{currentUser.annual_balance}</span>
              <span className="text-muted-foreground">/ {currentUser.annual_entitlement} days</span>
            </div>
            <Progress
              value={(currentUser.annual_balance / currentUser.annual_entitlement) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {currentUser.annual_taken} days used this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sick Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{currentUser.sick_balance}</span>
              <span className="text-muted-foreground">/ {currentUser.sick_entitlement} days</span>
            </div>
            <Progress
              value={(currentUser.sick_balance / currentUser.sick_entitlement) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {currentUser.sick_taken} days used this year
            </p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {myRequests.filter(r => r.status === 'pending' || r.status === 'pending_hr').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests awaiting approval
            </p>
          </CardContent>
        </Card>

        {/* Handover Tasks or Team Stats */}
        {isExec ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Org Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(((employees.length - onLeaveToday.length) / employees.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {onLeaveToday.length} on leave today
              </p>
            </CardContent>
          </Card>
        ) : isTeamLead || isHR ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isHR ? 'On Leave Today' : 'Team Size'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isHR ? onLeaveToday.length : teamMembers.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isHR ? 'Employees currently away' : 'Direct reports'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Handover Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks assigned to you
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Next Leave */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextLeave ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-primary/5 border">
                  <p className="font-semibold text-lg">
                    {formatDate(nextLeave.start_date)} - {formatDate(nextLeave.end_date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nextLeave.days_requested} working days · {nextLeave.leave_type} leave
                  </p>
                </div>
                <Badge className={getStatusColor(nextLeave.status)}>
                  {getStatusLabel(nextLeave.status)}
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-sm text-muted-foreground">No upcoming leave scheduled</p>
                <Link to="/leave/request">
                  <Button variant="outline" size="sm" className="mt-3">
                    Plan Leave
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} new</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {myNotifications.length > 0 ? (
              <div className="space-y-3">
                {myNotifications.slice(0, 4).map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${!notif.read ? 'bg-blue-50 border-blue-100' : ''}`}
                  >
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No notifications</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/leave/request">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Request New Leave
              </Button>
            </Link>
            <Link to="/leave/history">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                View Leave History
              </Button>
            </Link>
            <Link to="/handovers">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Manage Handovers
              </Button>
            </Link>
            {isExec && (
              <Link to="/exec">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Exec Dashboard
                </Button>
              </Link>
            )}
            {(isTeamLead || isHR) && (
              <Link to="/capacity">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Capacity Insights
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Leave Requests</CardTitle>
            <Link to="/leave/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {myRequests.length > 0 ? (
            <div className="space-y-3">
              {myRequests.slice(0, 5).map(request => (
                <div
                  key={request.request_id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      request.status === 'approved' ? 'bg-green-100' :
                      request.status === 'pending' || request.status === 'pending_hr' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      {request.status === 'approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : request.status === 'pending' || request.status === 'pending_hr' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{request.leave_type} Leave</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        <span className="mx-2">·</span>
                        {request.days_requested} days
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No leave requests yet</p>
              <Link to="/leave/request">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Request
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
