import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Building, Calendar, Users, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/mockData';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetDemo = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          View your profile and manage preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details from the company directory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${currentUser.full_name}`} />
                <AvatarFallback className="text-xl">{currentUser.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.full_name}</h2>
                <p className="text-muted-foreground">{currentUser.role}</p>
                <Badge variant="outline" className="mt-2">{currentUser.user_role}</Badge>
              </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Team</Label>
                  <p className="text-sm font-medium">{currentUser.team}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reports To</Label>
                  <p className="text-sm font-medium">{currentUser.tl_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Employment Date</Label>
                  <p className="text-sm font-medium">{formatDate(currentUser.employment_date)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave Balance</CardTitle>
            <CardDescription>Your current leave entitlements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Annual Leave</span>
                <span className="text-sm text-muted-foreground">
                  {currentUser.annual_balance} / {currentUser.annual_entitlement} days
                </span>
              </div>
              <Progress value={(currentUser.annual_balance / currentUser.annual_entitlement) * 100} />
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser.annual_taken} days used this year
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Sick Leave</span>
                <span className="text-sm text-muted-foreground">
                  {currentUser.sick_balance} / {currentUser.sick_entitlement} days
                </span>
              </div>
              <Progress value={(currentUser.sick_balance / currentUser.sick_entitlement) * 100} />
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser.sick_taken} days used this year
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Demo Mode</CardTitle>
          <CardDescription>
            You are currently viewing the NeverLeft demo. All data is simulated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-800">
            This demo allows you to explore all features of the leave management system
            including submitting requests, approvals, handovers, and viewing capacity insights.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleResetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo Data
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Current Year</Label>
              <p className="text-sm font-medium">{currentUser.year}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Country</Label>
              <p className="text-sm font-medium">{currentUser.country}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">HR Contact</Label>
              <p className="text-sm font-medium">{currentUser.hr_email || 'hr@curasel.com'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
