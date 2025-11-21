import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, UserCircle, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

const DemoWorkflow = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demo: Leave Request Approval Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Visual guide showing the complete end-to-end approval process
        </p>
      </div>

      {/* Overview Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            This demo shows the complete journey of a leave request from submission to final approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Follow along as <strong>Kabir Adebayo</strong> submits an annual leave request that flows through:
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm">Employee Submits</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-sm">Manager Reviews</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-sm">HR Reviews</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="default" className="text-sm">Final Approval</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Employee Submission */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
            </div>
            <div>
              <CardTitle>Employee Submits Leave Request</CardTitle>
              <CardDescription>Kabir Adebayo requests annual leave</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Request Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">Kabir Adebayo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">ka@curacel.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leave Type:</span>
                  <Badge variant="outline">Annual</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates:</span>
                  <span className="font-medium">Dec 20-24, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days:</span>
                  <span className="font-medium">5 workdays</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance Before:</span>
                  <span className="font-medium">7 days remaining</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">System Actions</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Validates employee has sufficient balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Checks employment duration (6+ months required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Verifies advance notice (7 days required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Excludes weekends & public holidays from count</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sets status: <Badge variant="outline" className="ml-1">Pending</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Routes to manager: Henry Okonkwo</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Request Created</p>
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Request ID:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">1734444000000</code>
                </p>
                <p className="text-blue-800 dark:text-blue-200 mt-1">
                  Manager Status: <Badge variant="outline" className="ml-1">Pending</Badge>
                  <span className="mx-2">•</span>
                  HR Status: <Badge variant="outline" className="ml-1">Pending</Badge>
                  <span className="mx-2">•</span>
                  Overall: <Badge variant="outline" className="ml-1">Pending</Badge>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Manager Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 font-bold">2</span>
            </div>
            <div>
              <CardTitle>Manager Reviews Request</CardTitle>
              <CardDescription>Henry Okonkwo (Manager) approves the leave</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Manager Dashboard</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Manager: <strong>Henry Okonkwo</strong> (ho@curacel.com)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Sees request on <strong>Team Approvals</strong> page</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Reviews: Employee details, dates, balance, handover doc</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Approves with comments (optional)</span>
                </li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">System Actions After Manager Approval</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Updates Manager Status: <Badge variant="default" className="ml-1">Approved</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Saves manager comments & approval date</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Checks policy: Annual leave <strong>requires HR approval</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Routes to HR for final approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Sets HR Status: <Badge variant="outline" className="ml-1">Pending</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Overall Status remains: <Badge variant="outline" className="ml-1">Pending</Badge></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">Manager Approved</p>
                <p className="text-orange-800 dark:text-orange-200">
                  Manager Status: <Badge variant="default" className="ml-1">Approved</Badge>
                  <span className="mx-2">•</span>
                  HR Status: <Badge variant="outline" className="ml-1">Pending</Badge>
                  <span className="mx-2">•</span>
                  Overall: <Badge variant="outline" className="ml-1">Pending</Badge>
                </p>
                <p className="text-orange-800 dark:text-orange-200 mt-1">
                  <strong>Manager Comments:</strong> "Approved. Enjoy your holiday!"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: HR Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-bold">3</span>
            </div>
            <div>
              <CardTitle>HR Final Review & Approval</CardTitle>
              <CardDescription>Ore Adeyemi (HR) provides final approval</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">HR Dashboard</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>HR: <strong>Ore Adeyemi</strong> (oa@curacel.com)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Sees request on <strong>HR Requests</strong> page</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Reviews: Employee details, manager approval, comments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Provides final approval with comments (optional)</span>
                </li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">System Actions After HR Approval</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Updates HR Status: <Badge variant="default" className="ml-1">Approved</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Saves HR comments & approval date</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sets Overall Status: <Badge variant="default" className="ml-1">Approved</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Updates employee balance in CSV</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Annual taken: 7 → 12 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Remaining balance: 7 → 2 days</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-900 dark:text-green-100 mb-1">✅ Final Approval Complete</p>
                <p className="text-green-800 dark:text-green-200">
                  Manager Status: <Badge variant="default" className="ml-1">Approved</Badge>
                  <span className="mx-2">•</span>
                  HR Status: <Badge variant="default" className="ml-1">Approved</Badge>
                  <span className="mx-2">•</span>
                  Overall: <Badge variant="default" className="ml-1">Approved</Badge>
                </p>
                <p className="text-green-800 dark:text-green-200 mt-1">
                  <strong>HR Comments:</strong> "Approved. Have a great break!"
                </p>
                <p className="text-green-800 dark:text-green-200 mt-1">
                  <strong>Balance Updated:</strong> Kabir now has 2 days annual leave remaining
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Flow: Rejection */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>Alternative: Rejection Flow</CardTitle>
              <CardDescription>What happens if manager or HR rejects the request</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">Manager Rejection</p>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Manager MUST provide rejection comments (required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Overall Status immediately set to: <Badge variant="destructive" className="ml-1">Rejected</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>No HR routing - manager rejection is final</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Employee balance unchanged</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">HR Rejection</p>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>HR MUST provide rejection comments (required)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Overall Status set to: <Badge variant="destructive" className="ml-1">Rejected</Badge></span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>HR rejection is final - no further routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Employee balance unchanged</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Guide */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Try It Yourself: Testing Guide</CardTitle>
          <CardDescription>Step-by-step instructions to test the workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-3">📝 Step-by-Step Test</p>
              <ol className="space-y-3 text-sm text-purple-800 dark:text-purple-200 list-decimal list-inside">
                <li className="font-medium">Login as Kabir (Employee)
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside font-normal">
                    <li>Email: <code className="bg-purple-100 dark:bg-purple-900 px-1 py-0.5 rounded">ka@curacel.com</code></li>
                    <li>Navigate to: <strong>Leave Request</strong></li>
                    <li>Submit annual leave for future dates</li>
                    <li>Note the Request ID</li>
                  </ul>
                </li>
                <li className="font-medium mt-3">Login as Henry (Manager)
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside font-normal">
                    <li>Email: <code className="bg-purple-100 dark:bg-purple-900 px-1 py-0.5 rounded">ho@curacel.com</code></li>
                    <li>Navigate to: <strong>Team Approvals</strong></li>
                    <li>See Kabir's request in pending list</li>
                    <li>Click Review → Approve (comments optional)</li>
                    <li>Verify it routes to HR</li>
                  </ul>
                </li>
                <li className="font-medium mt-3">Login as Ore (HR)
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside font-normal">
                    <li>Email: <code className="bg-purple-100 dark:bg-purple-900 px-1 py-0.5 rounded">oa@curacel.com</code></li>
                    <li>Navigate to: <strong>HR Requests</strong></li>
                    <li>See Kabir's request (manager approved)</li>
                    <li>Click Review → Approve (comments optional)</li>
                    <li>Verify status changes to Approved</li>
                  </ul>
                </li>
                <li className="font-medium mt-3">Verify Balance Update
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside font-normal">
                    <li>Navigate to: <strong>Admin → Employee Management</strong></li>
                    <li>Find Kabir Adebayo in the table</li>
                    <li>Check: <strong>Annual Taken</strong> increased by days requested</li>
                  </ul>
                </li>
                <li className="font-medium mt-3">View on Calendar
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside font-normal">
                    <li>Navigate to: <strong>Team Calendar</strong></li>
                    <li>See Kabir's approved leave displayed on calendar dates</li>
                    <li>See public holidays highlighted</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoWorkflow;
