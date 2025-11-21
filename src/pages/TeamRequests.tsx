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
import { CheckCircle2, Clock, XCircle, Eye, ExternalLink, Users, Calendar, ArrowRight } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/mockData';
import { LeaveRequest } from '@/types';

const TeamRequests = () => {
  const { currentUser } = useAuth();
  const { getTeamRequests, getTeamMembers } = useData();

  const [statusFilter, setStatusFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!currentUser) return null;

  const teamRequests = getTeamRequests(currentUser.email);
  const teamMembers = getTeamMembers(currentUser.email);

  // Filter requests
  const filteredRequests = useMemo(() => {
    let filtered = [...teamRequests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (memberFilter !== 'all') {
      filtered = filtered.filter(r => r.email === memberFilter);
    }

    // Sort by request date (newest first)
    return filtered.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
  }, [teamRequests, statusFilter, memberFilter]);

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
  const stats = {
    total: teamRequests.length,
    pending: teamRequests.filter(r => r.status === 'pending' || r.status === 'pending_hr').length,
    approved: teamRequests.filter(r => r.status === 'approved').length,
    declined: teamRequests.filter(r => r.status === 'declined' || r.status === 'hr_declined').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Leave Requests</h1>
        <p className="text-muted-foreground mt-1">
          View all leave requests from your team members
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
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
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team Member</Label>
              <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.email} value={member.email}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>All leave requests from your direct reports</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.request_id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${request.full_name}`} />
                      <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold">{request.full_name}</h4>
                        <Badge variant="outline" className="capitalize">{request.leave_type}</Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="font-medium">{request.days_requested} days</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
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
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Team Requests</h3>
              <p className="text-muted-foreground">
                {teamRequests.length === 0
                  ? "Your team members haven't submitted any leave requests yet."
                  : "No requests match your filter criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
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

              {/* Approval Status */}
              <div className="space-y-3">
                <Label className="text-muted-foreground text-xs">Approval Status</Label>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  selectedRequest.tl_status === 'approved' ? 'bg-green-50' :
                  selectedRequest.tl_status === 'declined' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  {getStatusIcon(selectedRequest.tl_status === 'approved' ? 'approved' : selectedRequest.tl_status === 'declined' ? 'declined' : 'pending')}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Team Lead Approval</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedRequest.tl_status}
                      {selectedRequest.tl_decision_date && ` on ${formatDate(selectedRequest.tl_decision_date)}`}
                    </p>
                  </div>
                </div>

                {selectedRequest.tl_status === 'approved' && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    selectedRequest.hr_status === 'approved' ? 'bg-green-50' :
                    selectedRequest.hr_status === 'declined' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    {getStatusIcon(selectedRequest.hr_status === 'approved' ? 'approved' : selectedRequest.hr_status === 'declined' ? 'declined' : 'pending')}
                    <div className="flex-1">
                      <p className="text-sm font-medium">HR Approval</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {selectedRequest.hr_status || 'Pending'}
                        {selectedRequest.hr_decision_date && ` on ${formatDate(selectedRequest.hr_decision_date)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Balance Info */}
              <div className="p-4 rounded-lg border bg-blue-50/50">
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

export default TeamRequests;
