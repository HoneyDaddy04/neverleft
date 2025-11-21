import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Clock, Users, TrendingUp, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/mockData';
import { LeaveRequest } from '@/types';

const HRRequests = () => {
  const { currentUser } = useAuth();
  const { getPendingHRApprovals, leaveRequests, processApproval, employees } = useData();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');

  if (!currentUser) return null;

  const pendingHRRequests = getPendingHRApprovals();

  // Get all requests for the "All Requests" view
  const allRequests = leaveRequests;

  // Filter requests based on filters
  const filteredRequests = allRequests.filter(request => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (leaveTypeFilter !== 'all' && request.leave_type !== leaveTypeFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());

  // Calculate stats
  const stats = {
    total: allRequests.length,
    pendingHR: pendingHRRequests.length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    declined: allRequests.filter(r => r.status === 'declined' || r.status === 'hr_declined').length,
  };

  // Monthly stats
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const approvedThisMonth = allRequests.filter(r => {
    if (r.status !== 'approved') return false;
    if (!r.hr_decision_date) return false;
    const decisionDate = new Date(r.hr_decision_date);
    return decisionDate.getMonth() === thisMonth && decisionDate.getFullYear() === thisYear;
  }).length;

  const handleReview = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !currentUser) return;

    setIsProcessing(true);
    try {
      processApproval({
        request_id: selectedRequest.request_id,
        action: 'approve',
        comment: comment || 'Approved by HR',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_role: 'hr',
      });

      toast.success('Leave request approved! Employee has been notified.');
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setComment('');
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest || !currentUser) return;

    if (!comment.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    setIsProcessing(true);
    try {
      processApproval({
        request_id: selectedRequest.request_id,
        action: 'decline',
        comment: comment,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_role: 'hr',
      });

      toast.success('Leave request declined. Employee has been notified.');
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setComment('');
    } catch (error) {
      toast.error('Failed to decline request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmployee = (email: string) => {
    return employees.find(e => e.email === email);
  };

  const canTakeAction = (request: LeaveRequest) => {
    return request.status === 'pending_hr';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HR Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage all company leave requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{employees.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting HR Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{stats.pendingHR}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{approvedThisMonth}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Pending vs All */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending HR Approval ({pendingHRRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileCheck className="h-4 w-4" />
            All Requests
          </TabsTrigger>
        </TabsList>

        {/* Pending HR Approval Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Requests Awaiting HR Approval</CardTitle>
              <CardDescription>These requests have been approved by Team Leads and require your final approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingHRRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No leave requests currently require HR approval.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>TL Approval</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingHRRequests.map((request) => {
                        const employee = getEmployee(request.email);
                        return (
                          <TableRow key={request.request_id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${request.full_name}`} />
                                  <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{request.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{employee?.role || request.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{employee?.team || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">{request.leave_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(request.start_date)} - {formatDate(request.end_date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{request.days_requested}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  Approved by {request.tl_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {request.tl_decision_date && formatDate(request.tl_decision_date)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" onClick={() => handleReview(request)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Requests Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending TL</SelectItem>
                      <SelectItem value="pending_hr">Pending HR</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="declined">Declined by TL</SelectItem>
                      <SelectItem value="hr_declined">Declined by HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Leave Requests ({filteredRequests.length})</CardTitle>
              <CardDescription>Complete history of all leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No requests match the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>TL Status</TableHead>
                        <TableHead>HR Status</TableHead>
                        <TableHead>Overall Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.request_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${request.full_name}`} />
                                <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.full_name}</div>
                                <div className="text-sm text-muted-foreground">{request.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{request.leave_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{request.days_requested}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              request.tl_status === 'approved' ? 'default' :
                              request.tl_status === 'declined' ? 'destructive' : 'secondary'
                            } className="capitalize">
                              {request.tl_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.hr_status ? (
                              <Badge variant={
                                request.hr_status === 'approved' ? 'default' :
                                request.hr_status === 'declined' ? 'destructive' : 'secondary'
                              } className="capitalize">
                                {request.hr_status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={canTakeAction(request) ? 'default' : 'ghost'}
                              onClick={() => handleReview(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {canTakeAction(request) ? 'Review' : 'View'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>Request ID: {selectedRequest?.request_id}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${selectedRequest.full_name}`} />
                  <AvatarFallback>{selectedRequest.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{selectedRequest.full_name}</div>
                  <div className="text-muted-foreground">{selectedRequest.email}</div>
                </div>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {getStatusLabel(selectedRequest.status)}
                </Badge>
              </div>

              {/* Leave Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Leave Type</Label>
                  <div className="font-medium capitalize">{selectedRequest.leave_type} Leave</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Days Requested</Label>
                  <div className="font-medium">{selectedRequest.days_requested} working days</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Start Date</Label>
                  <div className="font-medium">{formatDate(selectedRequest.start_date)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">End Date</Label>
                  <div className="font-medium">{formatDate(selectedRequest.end_date)}</div>
                </div>
              </div>

              {/* Balance Info */}
              <div className="p-4 rounded-lg border bg-blue-50/50">
                <Label className="text-muted-foreground text-xs mb-2 block">Leave Balance at Time of Request</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm">Annual Leave: </span>
                    <span className="font-semibold">{selectedRequest.annual_balance} days remaining</span>
                  </div>
                  <div>
                    <span className="text-sm">Sick Leave: </span>
                    <span className="font-semibold">{selectedRequest.sick_balance} days remaining</span>
                  </div>
                </div>
              </div>

              {/* Team Lead Approval Info */}
              <div className="p-4 rounded-lg border bg-green-50/50">
                <Label className="text-muted-foreground text-xs mb-2 block">Team Lead Approval</Label>
                <div className="flex items-center gap-2">
                  {selectedRequest.tl_status === 'approved' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : selectedRequest.tl_status === 'declined' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="font-medium capitalize">{selectedRequest.tl_status}</span>
                  <span className="text-muted-foreground">by {selectedRequest.tl_name}</span>
                </div>
                {selectedRequest.tl_comment && (
                  <div className="mt-2 text-sm bg-white/50 p-2 rounded">
                    <span className="text-muted-foreground">Comment: </span>
                    {selectedRequest.tl_comment}
                  </div>
                )}
                {selectedRequest.tl_decision_date && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Decision date: {formatDate(selectedRequest.tl_decision_date)}
                  </div>
                )}
              </div>

              {/* HR Decision (if exists) */}
              {selectedRequest.hr_status && (
                <div className={`p-4 rounded-lg border ${selectedRequest.hr_status === 'approved' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                  <Label className="text-muted-foreground text-xs mb-2 block">HR Decision</Label>
                  <div className="flex items-center gap-2">
                    {selectedRequest.hr_status === 'approved' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium capitalize">{selectedRequest.hr_status}</span>
                    {selectedRequest.hr_name && (
                      <span className="text-muted-foreground">by {selectedRequest.hr_name}</span>
                    )}
                  </div>
                  {selectedRequest.hr_comment && (
                    <div className="mt-2 text-sm bg-white/50 p-2 rounded">
                      <span className="text-muted-foreground">Comment: </span>
                      {selectedRequest.hr_comment}
                    </div>
                  )}
                  {selectedRequest.hr_decision_date && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Decision date: {formatDate(selectedRequest.hr_decision_date)}
                    </div>
                  )}
                </div>
              )}

              {/* Comment Input (only for pending_hr requests) */}
              {canTakeAction(selectedRequest) && (
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Comment</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (required for decline)..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isProcessing}
            >
              {canTakeAction(selectedRequest!) ? 'Cancel' : 'Close'}
            </Button>
            {selectedRequest && canTakeAction(selectedRequest) && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleDecline}
                  disabled={isProcessing}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button onClick={handleApprove} disabled={isProcessing}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRRequests;
