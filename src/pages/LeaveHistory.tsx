import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Clock, XCircle, Eye, ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/mockData';
import { LeaveRequest } from '@/types';

const LeaveHistory = () => {
  const { currentUser } = useAuth();
  const { getMyRequests } = useData();

  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!currentUser) return null;

  const myRequests = getMyRequests(currentUser.email);

  // Filter requests
  const filteredRequests = useMemo(() => {
    let filtered = [...myRequests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(r => {
        const year = new Date(r.start_date).getFullYear();
        return year.toString() === yearFilter;
      });
    }

    // Sort by request date (newest first)
    return filtered.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
  }, [myRequests, statusFilter, yearFilter]);

  const uniqueYears = useMemo(() => {
    const years = new Set(myRequests.map(r => new Date(r.start_date).getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [myRequests]);

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'pending':
      case 'pending_hr':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'declined':
      case 'hr_declined':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  // Stats
  const totalDaysUsed = myRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.days_requested, 0);

  const pendingCount = myRequests.filter(r => r.status === 'pending' || r.status === 'pending_hr').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave History</h1>
        <p className="text-muted-foreground mt-1">
          View all your past and upcoming leave requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalDaysUsed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending TL Approval</SelectItem>
                  <SelectItem value="pending_hr">Pending HR Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined by TL</SelectItem>
                  <SelectItem value="hr_declined">Declined by HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.request_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${
                      request.status === 'approved' ? 'bg-green-100' :
                      request.status === 'pending' || request.status === 'pending_hr' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      {getStatusIcon(request.status)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg capitalize">{request.leave_type} Leave</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="font-medium">{request.days_requested} days</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">TL:</span>
                            <Badge variant={
                              request.tl_status === 'approved' ? 'default' :
                              request.tl_status === 'declined' ? 'destructive' : 'secondary'
                            } className="text-xs capitalize">
                              {request.tl_status}
                            </Badge>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">HR:</span>
                            {request.hr_status ? (
                              <Badge variant={
                                request.hr_status === 'approved' ? 'default' :
                                request.hr_status === 'declined' ? 'destructive' : 'secondary'
                              } className="text-xs capitalize">
                                {request.hr_status}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Waiting</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <span>Submitted: {formatDate(request.request_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleViewDetails(request)}>
                    <Eye className="h-4 w-4" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Leave History</h3>
              <p className="text-muted-foreground">
                {myRequests.length === 0
                  ? "You haven't submitted any leave requests yet."
                  : "No requests match your filter criteria."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Request ID: {selectedRequest?.request_id}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge className={`${getStatusColor(selectedRequest.status)} text-base px-4 py-1`}>
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

              {/* Handover */}
              {selectedRequest.handover_link && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Handover Document</Label>
                  <a
                    href={selectedRequest.handover_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    View Document <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Approval Timeline */}
              <div className="space-y-3">
                <Label className="text-muted-foreground text-xs">Approval Timeline</Label>

                {/* Submitted */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Request Submitted</p>
                    <p className="text-xs text-muted-foreground">{formatDate(selectedRequest.request_date)}</p>
                  </div>
                </div>

                {/* Team Lead */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  selectedRequest.tl_status === 'approved' ? 'bg-green-50' :
                  selectedRequest.tl_status === 'declined' ? 'bg-red-50' : 'bg-muted/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedRequest.tl_status === 'approved' ? 'bg-green-100' :
                    selectedRequest.tl_status === 'declined' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {selectedRequest.tl_status === 'approved' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : selectedRequest.tl_status === 'declined' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Team Lead: {selectedRequest.tl_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedRequest.tl_status}
                      {selectedRequest.tl_decision_date && ` on ${formatDate(selectedRequest.tl_decision_date)}`}
                    </p>
                    {selectedRequest.tl_comment && (
                      <p className="text-xs mt-1 italic">"{selectedRequest.tl_comment}"</p>
                    )}
                  </div>
                </div>

                {/* HR (only if TL approved) */}
                {selectedRequest.tl_status === 'approved' && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    selectedRequest.hr_status === 'approved' ? 'bg-green-50' :
                    selectedRequest.hr_status === 'declined' ? 'bg-red-50' : 'bg-muted/50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedRequest.hr_status === 'approved' ? 'bg-green-100' :
                      selectedRequest.hr_status === 'declined' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {selectedRequest.hr_status === 'approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : selectedRequest.hr_status === 'declined' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">HR Approval</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {selectedRequest.hr_status || 'Pending'}
                        {selectedRequest.hr_decision_date && ` on ${formatDate(selectedRequest.hr_decision_date)}`}
                      </p>
                      {selectedRequest.hr_comment && (
                        <p className="text-xs mt-1 italic">"{selectedRequest.hr_comment}"</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Balance Info */}
              <div className="p-4 rounded-md bg-blue-50/50 border">
                <Label className="text-muted-foreground text-xs mb-2 block">Leave Balance at Request Time</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm">Annual Leave: </span>
                    <span className="font-medium">{selectedRequest.annual_balance} days</span>
                  </div>
                  <div>
                    <span className="text-sm">Sick Leave: </span>
                    <span className="font-medium">{selectedRequest.sick_balance} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveHistory;
