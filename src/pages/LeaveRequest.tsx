import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { calculateWorkingDays } from '@/lib/mockData';
import { LeaveType } from '@/types';

const LeaveRequest = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createLeaveRequest, employees } = useData();

  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [handoverLink, setHandoverLink] = useState('');
  const [notifiedManager, setNotifiedManager] = useState(false);
  const [willUpdateSlack, setWillUpdateSlack] = useState(false);
  const [willNotifyChannel, setWillNotifyChannel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  // Get team lead info
  const teamLead = employees.find(e => e.email === currentUser.tl_email);

  // Calculate working days
  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calculateWorkingDays(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );
  }, [startDate, endDate]);

  // Get current balance based on leave type
  const currentBalance = leaveType === 'annual'
    ? currentUser.annual_balance
    : currentUser.sick_balance;

  const totalEntitlement = leaveType === 'annual'
    ? currentUser.annual_entitlement
    : currentUser.sick_entitlement;

  // Validation
  const hasInsufficientBalance = workingDays > currentBalance;
  const needsHandover = leaveType === 'annual' && workingDays >= 3;
  const hasHandoverLink = handoverLink.trim().length > 0;
  const isHandoverValid = !needsHandover || hasHandoverLink;

  const canSubmit = startDate && endDate &&
    workingDays > 0 &&
    !hasInsufficientBalance &&
    isHandoverValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !currentUser) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (hasInsufficientBalance) {
      toast.error(`Insufficient ${leaveType} leave balance`);
      return;
    }

    if (needsHandover && !hasHandoverLink) {
      toast.error('Handover document is required for leave of 3+ days');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate days before request
      const today = new Date();
      const start = new Date(startDate);
      const daysBefore = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      createLeaveRequest({
        email: currentUser.email,
        full_name: currentUser.full_name,
        tl_email: currentUser.tl_email,
        tl_name: teamLead?.full_name || '',
        hr_email: currentUser.hr_email || 'hr@curacel.com',
        leave_type: leaveType,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        days_requested: workingDays,
        days_before_request: daysBefore,
        handover_link: handoverLink || '',
        annual_entitlement: currentUser.annual_entitlement,
        annual_taken: currentUser.annual_taken,
        annual_balance: currentUser.annual_balance,
        sick_entitlement: currentUser.sick_entitlement,
        sick_taken: currentUser.sick_taken,
        sick_balance: currentUser.sick_balance,
      });

      toast.success('Leave request submitted successfully!', {
        description: `Your ${workingDays}-day ${leaveType} leave request has been sent to ${teamLead?.full_name || 'your team lead'} for approval.`,
      });

      // Reset form and redirect
      navigate('/leave/history');
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Request Leave</h1>
        <p className="text-muted-foreground mt-1">
          Submit a new leave request for approval
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leave Details</CardTitle>
            <CardDescription>Fill in your leave information below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type *</Label>
              <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                <SelectTrigger id="leave-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">
                    Annual Leave ({currentUser.annual_balance} days available)
                  </SelectItem>
                  <SelectItem value="sick">
                    Sick Leave ({currentUser.sick_balance} days available)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => !startDate || date < startDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Duration Display */}
            {startDate && endDate && (
              <div className={`p-4 rounded-lg border ${hasInsufficientBalance ? 'border-red-200 bg-red-50' : 'bg-muted'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-lg font-bold">{workingDays} working days</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">After this request:</span>
                  <Badge variant={hasInsufficientBalance ? 'destructive' : 'default'}>
                    {currentBalance - workingDays} days remaining
                  </Badge>
                </div>
                {hasInsufficientBalance && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Insufficient leave balance
                  </p>
                )}
              </div>
            )}

            {/* Handover Document Link */}
            {leaveType === 'annual' && (
              <div className="space-y-2">
                <Label htmlFor="handover-link">
                  Handover Document Link {needsHandover && '*'}
                </Label>
                <Input
                  id="handover-link"
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={handoverLink}
                  onChange={(e) => setHandoverLink(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {needsHandover
                    ? 'Required for leave of 3+ working days. Provide a link to your handover document.'
                    : 'Optional handover document (Google Docs, Notion, etc.)'}
                </p>
              </div>
            )}

            {/* Approval Flow Info */}
            <div className="p-4 rounded-lg border bg-blue-50/50">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Approval Workflow</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your request will be sent to {teamLead?.full_name || 'your team lead'} for approval,
                    then forwarded to HR for final approval.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                    <span>You</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>Team Lead</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>HR</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium">Approved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3 p-4 rounded-lg border">
              <p className="font-medium text-sm">Before Submitting:</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manager"
                    checked={notifiedManager}
                    onCheckedChange={(checked) => setNotifiedManager(checked as boolean)}
                  />
                  <label htmlFor="manager" className="text-sm cursor-pointer">
                    I have discussed this leave with my team lead
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="slack"
                    checked={willUpdateSlack}
                    onCheckedChange={(checked) => setWillUpdateSlack(checked as boolean)}
                  />
                  <label htmlFor="slack" className="text-sm cursor-pointer">
                    I will update my Slack status when leave starts
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel"
                    checked={willNotifyChannel}
                    onCheckedChange={(checked) => setWillNotifyChannel(checked as boolean)}
                  />
                  <label htmlFor="channel" className="text-sm cursor-pointer">
                    I will notify the #leave channel about my absence
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Validation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {startDate && endDate ? (
                <>
                  {/* Working Days */}
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dates Selected</p>
                      <p className="text-xs text-muted-foreground">
                        {workingDays} working day{workingDays !== 1 ? 's' : ''} (excludes weekends)
                      </p>
                    </div>
                  </div>

                  {/* Balance Check */}
                  <div className="flex items-start gap-2">
                    {hasInsufficientBalance ? (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {hasInsufficientBalance ? 'Insufficient Balance' : 'Balance Sufficient'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentBalance} days available
                      </p>
                    </div>
                  </div>

                  {/* Handover Check */}
                  {leaveType === 'annual' && needsHandover && (
                    <div className="flex items-start gap-2">
                      {hasHandoverLink ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {hasHandoverLink ? 'Handover Provided' : 'Handover Required'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Required for 3+ day leave
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select dates to validate your request
                </p>
              )}
            </CardContent>
          </Card>

          {/* Leave Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Annual Leave</span>
                  <span className="font-semibold">{currentUser.annual_balance} / {currentUser.annual_entitlement}</span>
                </div>
                <Progress value={(currentUser.annual_balance / currentUser.annual_entitlement) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentUser.annual_taken} days used this year
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Sick Leave</span>
                  <span className="font-semibold">{currentUser.sick_balance} / {currentUser.sick_entitlement}</span>
                </div>
                <Progress value={(currentUser.sick_balance / currentUser.sick_entitlement) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentUser.sick_taken} days used this year
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>

          {!canSubmit && startDate && endDate && (
            <p className="text-xs text-center text-muted-foreground">
              Please resolve validation issues before submitting
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LeaveRequest;
