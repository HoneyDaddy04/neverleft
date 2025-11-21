import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  ThermometerSun,
  Battery,
  Gauge,
} from 'lucide-react';

const OrgHealth = () => {
  const { currentUser } = useAuth();
  const { employees, leaveRequests, getOnLeaveToday } = useData();

  if (!currentUser) return null;

  const onLeaveToday = getOnLeaveToday();
  const totalEmployees = employees.length;

  // Calculate various health metrics
  const leaveUtilization = employees.map(e => ({
    ...e,
    utilization: Math.round((e.annual_taken / e.annual_entitlement) * 100),
    remaining: e.annual_balance,
  }));

  // Burnout risk: high utilization + low balance
  const highRisk = leaveUtilization.filter(e => e.utilization >= 70 && e.remaining <= 4);
  const mediumRisk = leaveUtilization.filter(e => e.utilization >= 50 && e.utilization < 70);
  const lowRisk = leaveUtilization.filter(e => e.utilization < 50);

  // Department health
  const departments = [...new Set(employees.map(e => e.team))];
  const deptHealth = departments.map(dept => {
    const deptEmps = leaveUtilization.filter(e => e.team === dept);
    const avgUtilization = Math.round(deptEmps.reduce((sum, e) => sum + e.utilization, 0) / deptEmps.length);
    const avgRemaining = Math.round(deptEmps.reduce((sum, e) => sum + e.remaining, 0) / deptEmps.length);
    const atRisk = deptEmps.filter(e => e.utilization >= 70).length;
    return { name: dept, count: deptEmps.length, avgUtilization, avgRemaining, atRisk };
  }).sort((a, b) => b.avgUtilization - a.avgUtilization);

  // Overall org health score (0-100)
  const healthScore = Math.round(
    100 - (highRisk.length / totalEmployees) * 50 - (mediumRisk.length / totalEmployees) * 20
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Organization Health</h1>
            <p className="text-muted-foreground mt-1">
              Workforce wellness and leave balance metrics
            </p>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <Card className={`border-l-4 ${healthScore >= 80 ? 'border-l-green-500' : healthScore >= 60 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${healthScore >= 80 ? 'bg-green-100' : healthScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <Gauge className={`h-8 w-8 ${healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organization Health Score</p>
                <p className="text-4xl font-bold">{healthScore}/100</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={healthScore >= 80 ? 'bg-green-100 text-green-700' : healthScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Based on leave utilization and balance distribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highRisk.length}</div>
            <p className="text-xs text-muted-foreground">
              70%+ leave used, 4 days or less remaining
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{mediumRisk.length}</div>
            <p className="text-xs text-muted-foreground">
              50-70% leave used, moderate balance
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Low Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{lowRisk.length}</div>
            <p className="text-xs text-muted-foreground">
              Less than 50% leave used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Health
          </CardTitle>
          <CardDescription>Leave utilization and risk by team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deptHealth.map((dept) => (
            <div key={dept.name} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{dept.name}</span>
                  <Badge variant="outline">{dept.count} employees</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {dept.atRisk > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {dept.atRisk} at risk
                    </Badge>
                  )}
                  <Badge
                    className={
                      dept.avgUtilization >= 70 ? 'bg-red-100 text-red-700' :
                      dept.avgUtilization >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }
                  >
                    {dept.avgUtilization}% utilized
                  </Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg Leave Utilization</span>
                    <span className="font-medium">{dept.avgUtilization}%</span>
                  </div>
                  <Progress value={dept.avgUtilization} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg Days Remaining</span>
                    <span className="font-medium">{dept.avgRemaining} days</span>
                  </div>
                  <Progress value={(dept.avgRemaining / 14) * 100} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* High Risk Employees */}
      {highRisk.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Heart className="h-5 w-5" />
              Employees Needing Attention
            </CardTitle>
            <CardDescription>High leave utilization with low remaining balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRisk.map((emp) => (
                <div key={emp.email} className="flex items-center justify-between p-3 rounded-lg border bg-red-50/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${emp.full_name}`} />
                      <AvatarFallback>{emp.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground">{emp.role} · {emp.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600">{emp.remaining} days left</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{emp.annual_taken} of {emp.annual_entitlement} used</p>
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

export default OrgHealth;
