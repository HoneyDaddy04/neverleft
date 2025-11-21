import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Crown,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
  UserX,
  Heart,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ExecDashboard = () => {
  const { currentUser } = useAuth();
  const { employees, leaveRequests, getOnLeaveToday } = useData();

  if (!currentUser) return null;

  const onLeaveToday = getOnLeaveToday();
  const totalEmployees = employees.length;
  const availableToday = totalEmployees - onLeaveToday.length;
  const capacityPercentage = Math.round((availableToday / totalEmployees) * 100);

  // Calculate department stats
  const departments = [...new Set(employees.map(e => e.team))];
  const departmentStats = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.team === dept);
    const deptOnLeave = onLeaveToday.filter(e =>
      employees.find(emp => emp.email === e.email)?.team === dept
    );
    return {
      name: dept,
      total: deptEmployees.length,
      available: deptEmployees.length - deptOnLeave.length,
      capacity: Math.round(((deptEmployees.length - deptOnLeave.length) / deptEmployees.length) * 100),
    };
  }).sort((a, b) => a.capacity - b.capacity);

  // Calculate leave trends
  const pendingRequests = leaveRequests.filter(r => r.status === 'pending' || r.status === 'pending_hr');
  const approvedThisMonth = leaveRequests.filter(r => {
    const date = new Date(r.request_date);
    const now = new Date();
    return r.status === 'approved' && date.getMonth() === now.getMonth();
  });

  // Low balance alerts
  const lowBalanceEmployees = employees.filter(e =>
    (e.annual_balance / e.annual_entitlement) < 0.2
  );

  // Burnout risk (high leave usage + low balance)
  const burnoutRisk = employees.filter(e =>
    e.annual_taken >= 10 && e.annual_balance <= 4
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Executive Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Organization health and strategic insights
              </p>
            </div>
          </div>
        </div>
        <Link to="/exec/briefing">
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-4 w-4" />
            AI Briefing
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Org Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{capacityPercentage}%</span>
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {availableToday} of {totalEmployees} available today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{totalEmployees}</span>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {departments.length} departments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{pendingRequests.length}</span>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingRequests.filter(r => r.status === 'pending_hr').length} awaiting HR
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Burnout Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">{burnoutRisk.length}</span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Employees need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Health
            </CardTitle>
            <CardDescription>Capacity by team - lower capacity highlighted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dept.available}/{dept.total} available
                    </span>
                    <Badge
                      variant={dept.capacity >= 80 ? 'default' : dept.capacity >= 60 ? 'secondary' : 'destructive'}
                    >
                      {dept.capacity}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={dept.capacity}
                  className={`h-2 ${dept.capacity < 60 ? '[&>div]:bg-red-500' : dept.capacity < 80 ? '[&>div]:bg-yellow-500' : ''}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Insights
            </CardTitle>
            <CardDescription>Key items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* On Leave Today */}
            <div className="p-4 rounded-lg border bg-blue-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">On Leave Today</span>
                </div>
                <Badge variant="outline">{onLeaveToday.length} people</Badge>
              </div>
              {onLeaveToday.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {onLeaveToday.slice(0, 3).map(e => e.full_name).join(', ')}
                  {onLeaveToday.length > 3 && ` and ${onLeaveToday.length - 3} more`}
                </p>
              ) : (
                <p className="text-sm text-green-600">Full team available!</p>
              )}
            </div>

            {/* Low Balance Alert */}
            {lowBalanceEmployees.length > 0 && (
              <div className="p-4 rounded-lg border bg-orange-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Low Leave Balance</span>
                  </div>
                  <Badge variant="outline" className="text-orange-600">
                    {lowBalanceEmployees.length} employees
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  These employees have used over 80% of their annual leave
                </p>
              </div>
            )}

            {/* Burnout Risk */}
            {burnoutRisk.length > 0 && (
              <div className="p-4 rounded-lg border bg-red-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Burnout Risk</span>
                  </div>
                  <Badge variant="destructive">{burnoutRisk.length} at risk</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  High leave usage but low remaining balance - may need wellness check
                </p>
              </div>
            )}

            {/* Approvals This Month */}
            <div className="p-4 rounded-lg border bg-green-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Approved This Month</span>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {approvedThisMonth.length} requests
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {approvedThisMonth.reduce((sum, r) => sum + r.days_requested, 0)} total days approved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link to="/exec/health">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Activity className="h-5 w-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Org Health Report</p>
                  <p className="text-xs text-muted-foreground">Detailed wellness metrics</p>
                </div>
              </Button>
            </Link>
            <Link to="/exec/briefing">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Sparkles className="h-5 w-5 mr-3 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">AI Briefing</p>
                  <p className="text-xs text-muted-foreground">Strategic insights</p>
                </div>
              </Button>
            </Link>
            <Link to="/capacity">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Building2 className="h-5 w-5 mr-3 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">All Departments</p>
                  <p className="text-xs text-muted-foreground">Capacity breakdown</p>
                </div>
              </Button>
            </Link>
            <Link to="/team/calendar">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Leave Calendar</p>
                  <p className="text-xs text-muted-foreground">Company-wide view</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecDashboard;
