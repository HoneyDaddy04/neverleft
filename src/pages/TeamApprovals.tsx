import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, ExternalLink, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/mockData';
import { LeaveRequest } from '@/types';

const TeamApprovals = () => {
  const { currentUser } = useAuth();
  const { getPendingTLApprovals, getTeamRequests, processApproval, getTeamMembers } = useData();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentUser) return null;

  const pendingRequests = getPendingTLApprovals(currentUser.email);
  const allTeamRequests = getTeamRequests(currentUser.email);
  const teamMembers = getTeamMembers(currentUser.email);

  // Calculate stats
  const approvedThisMonth = allTeamRequests.filter(r => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    if (r.tl_status !== 'approved') return false;
    const decisionDate = new Date(r.tl_decision_date);
    return decisionDate.getMonth() === thisMonth && decisionDate.getFullYear() === thisYear;
  }).length;

  const declinedThisMonth = allTeamRequests.filter(r => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    if (r.tl_status !== 'declined') return false;
    const decisionDate = new Date(r.tl_decision_date);
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
        comment: comment || 'Approved',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_role: 'tl',
      });

      toast.success('Leave request approved and sent to HR for final approval');
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
        actor_role: 'tl',
      });

      toast.success('Leave request declined');
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setComment('');
    } catch (error) {
      toast.error('Failed to decline request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve leave requests from your team members
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{teamMembers.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{pendingRequests.length}</span>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Declined This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{declinedThisMonth}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          <CardDescription>Leave requests awaiting your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No pending leave requests require your approval.
              </p>
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
                    <TableHead>Submitted</TableHead>
                    <TableHead>Handover</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.request_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${request.full_name}`} />
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
                        <div className="text-sm text-muted-foreground">
                          {formatDate(request.request_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.handover_link ? (
                          <a
                            href={request.handover_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleReview(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
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

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>Request ID: {selectedRequest?.request_id}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${selectedRequest.full_name}`} />
                  <AvatarFallback>{selectedRequest.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">{selectedRequest.full_name}</div>
                  <div className="text-muted-foreground">{selectedRequest.email}</div>
                </div>
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

              {/* Handover Link */}
              {selectedRequest.handover_link && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Handover Document</Label>
                  <a
                    href={selectedRequest.handover_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    View Handover Document <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Comment */}
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
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamApprovals;
