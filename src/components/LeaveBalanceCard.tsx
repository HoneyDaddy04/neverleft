import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Heart } from 'lucide-react';
import { calculateAnnualLeaveEntitlement } from '@/lib/mockData';

export const LeaveBalanceCard = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const totalAnnual = calculateAnnualLeaveEntitlement(currentUser.startDate);
  const usedAnnual = totalAnnual - currentUser.annualLeaveBalance;
  const annualPercentage = (usedAnnual / totalAnnual) * 100;

  const totalSick = 7;
  const usedSick = totalSick - currentUser.sickLeaveBalance;
  const sickPercentage = (usedSick / totalSick) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Annual Leave */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-light">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">Annual Leave</span>
            </div>
            <span className="text-sm font-semibold">
              {currentUser.annualLeaveBalance} / {totalAnnual} days
            </span>
          </div>
          <Progress value={annualPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {usedAnnual} days used this year
          </p>
        </div>

        {/* Sick Leave */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success-light">
                <Heart className="h-4 w-4 text-success" />
              </div>
              <span className="font-medium">Sick Leave</span>
            </div>
            <span className="text-sm font-semibold">
              {currentUser.sickLeaveBalance} / {totalSick} days
            </span>
          </div>
          <Progress value={sickPercentage} className="h-2 bg-success-light [&>div]:bg-success" />
          <p className="text-xs text-muted-foreground">
            {usedSick} days used this year
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
