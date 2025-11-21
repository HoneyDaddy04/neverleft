import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Clock, Eye, MessageSquare, Plus, Send, HelpCircle, Search, Calendar, CreditCard, Users, FileQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/mockData';
import { Query, LeaveRequest, QueryCategory, SupportQuery } from '@/types';
import { format } from 'date-fns';

const categoryLabels: Record<QueryCategory, { label: string; icon: React.ReactNode }> = {
  leave_policy: { label: 'Leave Policy', icon: <Calendar className="h-4 w-4" /> },
  benefits: { label: 'Benefits', icon: <Users className="h-4 w-4" /> },
  payroll: { label: 'Payroll', icon: <CreditCard className="h-4 w-4" /> },
  general: { label: 'General', icon: <HelpCircle className="h-4 w-4" /> },
  complaint: { label: 'Complaint', icon: <AlertCircle className="h-4 w-4" /> },
  other: { label: 'Other', icon: <FileQuestion className="h-4 w-4" /> },
};

const HRQueries = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, employees, getAllSupportQueries, getOpenSupportQueries, respondToSupportQuery } = useData();

  // Local state for leave request queries (in a real app this would be in DataContext)
  const [queries, setQueries] = useState<Query[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [responseText, setResponseText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Support query state
  const [selectedSupportQuery, setSelectedSupportQuery] = useState<SupportQuery | null>(null);
  const [supportResponseText, setSupportResponseText] = useState('');
  const [isSupportRespondModalOpen, setIsSupportRespondModalOpen] = useState(false);
  const [supportSearchTerm, setSupportSearchTerm] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // New query form state
  const [newQuery, setNewQuery] = useState({
    request_id: '',
    reason: '',
    message: '',
  });

  if (!currentUser) return null;

  // Get support queries from context
  const allSupportQueries = getAllSupportQueries();
  const openSupportQueries = getOpenSupportQueries();

  // Get pending HR requests that might need queries
  const pendingRequests = leaveRequests.filter(r =>
    r.status === 'pending_hr' || r.status === 'pending'
  );

  // Filter leave request queries
  const filteredQueries = useMemo(() => {
    let filtered = [...queries];

    if (statusFilter === 'pending') {
      filtered = filtered.filter(q => !q.resolved);
    } else if (statusFilter === 'resolved') {
      filtered = filtered.filter(q => q.resolved);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.from_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [queries, statusFilter, searchTerm]);

  // Filter support queries
  const filteredSupportQueries = useMemo(() => {
    let filtered = [...allSupportQueries];

    if (supportStatusFilter === 'open') {
      filtered = filtered.filter(q => q.status !== 'resolved');
    } else if (supportStatusFilter === 'resolved') {
      filtered = filtered.filter(q => q.status === 'resolved');
    }

    if (supportSearchTerm) {
      filtered = filtered.filter(q =>
        q.from_name.toLowerCase().includes(supportSearchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(supportSearchTerm.toLowerCase()) ||
        q.message.toLowerCase().includes(supportSearchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allSupportQueries, supportStatusFilter, supportSearchTerm]);

  // Stats
  const leaveQueryStats = {
    total: queries.length,
    pending: queries.filter(q => !q.resolved).length,
    resolved: queries.filter(q => q.resolved).length,
  };

  const supportQueryStats = {
    total: allSupportQueries.length,
    open: openSupportQueries.length,
    resolved: allSupportQueries.filter(q => q.status === 'resolved').length,
  };

  const handleCreateQuery = () => {
    if (!newQuery.request_id) {
      toast.error('Please select a leave request');
      return;
    }
    if (!newQuery.reason.trim()) {
      toast.error('Please select a reason');
      return;
    }
    if (!newQuery.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const request = leaveRequests.find(r => r.request_id === newQuery.request_id);
    if (!request) {
      toast.error('Leave request not found');
      return;
    }

    const query: Query = {
      id: `QRY-${Date.now()}`,
      request_id: newQuery.request_id,
      from_email: currentUser.email,
      from_name: currentUser.full_name,
      reason: newQuery.reason,
      message: newQuery.message,
      response: null,
      responded_at: null,
      resolved: false,
      created_at: new Date().toISOString(),
    };

    setQueries(prev => [query, ...prev]);
    toast.success('Query created successfully', {
      description: `Query sent regarding ${request.full_name}'s leave request.`,
    });

    setIsCreateModalOpen(false);
    setNewQuery({ request_id: '', reason: '', message: '' });
  };

  const handleRespond = () => {
    if (!selectedQuery) return;
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setQueries(prev => prev.map(q => {
      if (q.id !== selectedQuery.id) return q;
      return {
        ...q,
        response: responseText,
        responded_at: new Date().toISOString(),
        resolved: true,
      };
    }));

    toast.success('Query resolved', {
      description: 'The query has been marked as resolved.',
    });

    setIsRespondModalOpen(false);
    setSelectedQuery(null);
    setResponseText('');
  };

  const handleSupportQueryRespond = () => {
    if (!selectedSupportQuery) return;
    if (!supportResponseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    respondToSupportQuery(
      selectedSupportQuery.id,
      supportResponseText,
      currentUser.email,
      currentUser.full_name
    );

    toast.success('Query resolved', {
      description: `Response sent to ${selectedSupportQuery.from_name}. They will be notified.`,
    });

    setIsSupportRespondModalOpen(false);
    setSelectedSupportQuery(null);
    setSupportResponseText('');
  };

  const handleViewQuery = (query: Query) => {
    setSelectedQuery(query);
    setResponseText(query.response || '');
    setIsRespondModalOpen(true);
  };

  const handleViewSupportQuery = (query: SupportQuery) => {
    setSelectedSupportQuery(query);
    setSupportResponseText(query.response || '');
    setIsSupportRespondModalOpen(true);
  };

  const getRequestInfo = (requestId: string): LeaveRequest | undefined => {
    return leaveRequests.find(r => r.request_id === requestId);
  };

  const queryReasons = [
    'Missing documentation',
    'Insufficient leave balance',
    'Handover incomplete',
    'Overlapping leave with team',
    'Policy violation',
    'Clarification needed',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Query Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage leave request queries and employee support requests
          </p>
        </div>
      </div>

      <Tabs defaultValue="support" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="support" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Employee Support ({openSupportQueries.length})
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Leave Queries ({leaveQueryStats.pending})
          </TabsTrigger>
        </TabsList>

        {/* Employee Support Queries Tab */}
        <TabsContent value="support" className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{supportQueryStats.total}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{supportQueryStats.open}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{supportQueryStats.resolved}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, subject, or message..."
                      value={supportSearchTerm}
                      onChange={(e) => setSupportSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={supportStatusFilter} onValueChange={(v: 'all' | 'open' | 'resolved') => setSupportStatusFilter(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Queries</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Queries List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Support Queries ({filteredSupportQueries.length})</CardTitle>
              <CardDescription>Questions and requests from employees</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSupportQueries.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No Support Queries</h3>
                  <p className="text-muted-foreground">
                    {allSupportQueries.length === 0
                      ? 'No employee queries have been submitted yet.'
                      : 'No queries match your filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSupportQueries.map((query) => (
                    <div
                      key={query.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${query.from_name}`} />
                          <AvatarFallback>{query.from_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold">{query.subject}</h4>
                            <Badge variant={query.status === 'resolved' ? 'default' : query.status === 'in_progress' ? 'secondary' : 'outline'}>
                              {query.status === 'resolved' ? 'Resolved' : query.status === 'in_progress' ? 'In Progress' : 'Open'}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              {categoryLabels[query.category].icon}
                              {categoryLabels[query.category].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            From: <span className="font-medium">{query.from_name}</span>
                          </p>
                          <p className="text-sm line-clamp-2">{query.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted on {format(new Date(query.created_at), 'PPP')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewSupportQuery(query)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {query.status === 'resolved' ? 'View' : 'Respond'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Request Queries Tab */}
        <TabsContent value="leave" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Query
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{leaveQueryStats.total}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{leaveQueryStats.pending}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{leaveQueryStats.resolved}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, reason, or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={(v: 'all' | 'pending' | 'resolved') => setStatusFilter(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Queries</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queries List */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Request Queries ({filteredQueries.length})</CardTitle>
              <CardDescription>Queries regarding incomplete or non-compliant leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredQueries.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No Active Queries</h3>
                  <p className="text-muted-foreground">
                    {queries.length === 0
                      ? 'All leave requests are currently compliant with policy.'
                      : 'No queries match your filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQueries.map((query) => {
                    const request = getRequestInfo(query.request_id);
                    return (
                      <div
                        key={query.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${query.resolved ? 'bg-green-100' : 'bg-orange-100'}`}>
                            {query.resolved ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-semibold">{query.reason}</h4>
                              <Badge variant={query.resolved ? 'default' : 'secondary'}>
                                {query.resolved ? 'Resolved' : 'Pending'}
                              </Badge>
                            </div>
                            {request && (
                              <p className="text-sm text-muted-foreground">
                                Regarding: <span className="font-medium">{request.full_name}</span>'s {request.leave_type} leave request
                                ({formatDate(request.start_date)} - {formatDate(request.end_date)})
                              </p>
                            )}
                            <p className="text-sm line-clamp-2">{query.message}</p>
                            <p className="text-xs text-muted-foreground">
                              Created by {query.from_name} on {formatDate(query.created_at)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewQuery(query)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {query.resolved ? 'View' : 'Respond'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Query Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Query</DialogTitle>
            <DialogDescription>
              Send a query regarding a leave request that needs clarification or additional information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Leave Request *</Label>
              <Select
                value={newQuery.request_id}
                onValueChange={(v) => setNewQuery({ ...newQuery, request_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a pending request" />
                </SelectTrigger>
                <SelectContent>
                  {pendingRequests.map((request) => (
                    <SelectItem key={request.request_id} value={request.request_id}>
                      {request.full_name} - {request.leave_type} ({formatDate(request.start_date)})
                    </SelectItem>
                  ))}
                  {pendingRequests.length === 0 && (
                    <SelectItem value="" disabled>
                      No pending requests
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select
                value={newQuery.reason}
                onValueChange={(v) => setNewQuery({ ...newQuery, reason: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {queryReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={newQuery.message}
                onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })}
                placeholder="Describe the issue or what information is needed..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuery} className="gap-2">
              <Send className="h-4 w-4" />
              Send Query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond/View Leave Query Modal */}
      <Dialog open={isRespondModalOpen} onOpenChange={setIsRespondModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedQuery?.resolved ? 'View Query' : 'Respond to Query'}</DialogTitle>
            <DialogDescription>Query ID: {selectedQuery?.id}</DialogDescription>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-4 py-4">
              {/* Query Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{selectedQuery.reason}</span>
                  <Badge variant={selectedQuery.resolved ? 'default' : 'secondary'}>
                    {selectedQuery.resolved ? 'Resolved' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm">{selectedQuery.message}</p>
                <p className="text-xs text-muted-foreground">
                  From: {selectedQuery.from_name} • {formatDate(selectedQuery.created_at)}
                </p>
              </div>

              {/* Related Request */}
              {(() => {
                const request = getRequestInfo(selectedQuery.request_id);
                return request ? (
                  <div className="p-4 rounded-lg border bg-blue-50/50">
                    <Label className="text-muted-foreground text-xs mb-2 block">Related Leave Request</Label>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${request.full_name}`} />
                        <AvatarFallback>{request.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{request.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.leave_type} leave: {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Response */}
              {selectedQuery.resolved && selectedQuery.response ? (
                <div className="p-4 rounded-lg border bg-green-50/50">
                  <Label className="text-muted-foreground text-xs mb-2 block">Resolution</Label>
                  <p className="text-sm">{selectedQuery.response}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resolved on {formatDate(selectedQuery.responded_at || '')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Your Response *</Label>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response or resolution..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRespondModalOpen(false)}>
              {selectedQuery?.resolved ? 'Close' : 'Cancel'}
            </Button>
            {!selectedQuery?.resolved && (
              <Button onClick={handleRespond} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolve Query
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond/View Support Query Modal */}
      <Dialog open={isSupportRespondModalOpen} onOpenChange={setIsSupportRespondModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSupportQuery?.status === 'resolved' ? 'View Query' : 'Respond to Query'}</DialogTitle>
            <DialogDescription>Query ID: {selectedSupportQuery?.id}</DialogDescription>
          </DialogHeader>

          {selectedSupportQuery && (
            <div className="space-y-4 py-4">
              {/* Query Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{selectedSupportQuery.subject}</span>
                  <Badge variant={selectedSupportQuery.status === 'resolved' ? 'default' : 'secondary'}>
                    {selectedSupportQuery.status === 'resolved' ? 'Resolved' : selectedSupportQuery.status === 'in_progress' ? 'In Progress' : 'Open'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {categoryLabels[selectedSupportQuery.category].icon}
                    {categoryLabels[selectedSupportQuery.category].label}
                  </Badge>
                </div>
                <p className="text-sm">{selectedSupportQuery.message}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${selectedSupportQuery.from_name}`} />
                    <AvatarFallback>{selectedSupportQuery.from_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">
                    From: {selectedSupportQuery.from_name} • {format(new Date(selectedSupportQuery.created_at), 'PPP')}
                  </p>
                </div>
              </div>

              {/* Response */}
              {selectedSupportQuery.status === 'resolved' && selectedSupportQuery.response ? (
                <div className="p-4 rounded-lg border bg-green-50/50">
                  <Label className="text-muted-foreground text-xs mb-2 block">Your Response</Label>
                  <p className="text-sm">{selectedSupportQuery.response}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Responded by {selectedSupportQuery.responded_by_name} on {selectedSupportQuery.responded_at && format(new Date(selectedSupportQuery.responded_at), 'PPP')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Your Response *</Label>
                  <Textarea
                    value={supportResponseText}
                    onChange={(e) => setSupportResponseText(e.target.value)}
                    placeholder="Enter your response to the employee..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupportRespondModalOpen(false)}>
              {selectedSupportQuery?.status === 'resolved' ? 'Close' : 'Cancel'}
            </Button>
            {selectedSupportQuery?.status !== 'resolved' && (
              <Button onClick={handleSupportQueryRespond} className="gap-2">
                <Send className="h-4 w-4" />
                Send Response
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRQueries;
