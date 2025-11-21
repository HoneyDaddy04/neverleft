import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  CheckCheck,
  Send,
  Calendar,
  User,
  MessageSquare,
  PlayCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/mockData';
import { HandoverTask, TaskComment } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const Handovers = () => {
  const { currentUser } = useAuth();
  const { getMyHandovers, getAssignedToMe, createHandoverTask, updateHandoverTask, employees, leaveRequests } = useData();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<HandoverTask | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee_email: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    request_id: '',
  });

  if (!currentUser) return null;

  const myHandovers = getMyHandovers(currentUser.email);
  const assignedToMe = getAssignedToMe(currentUser.email);

  // Get approved/pending leave requests for the current user (for linking handovers)
  const myUpcomingLeaves = leaveRequests.filter(
    r => r.email === currentUser.email &&
    (r.status === 'approved' || r.status === 'pending_hr') &&
    new Date(r.end_date) >= new Date()
  );

  // Get team members for assignee selection
  const availableAssignees = employees.filter(e => e.email !== currentUser.email);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!newTask.assignee_email) {
      toast.error('Please select an assignee');
      return;
    }

    const assignee = employees.find(e => e.email === newTask.assignee_email);

    createHandoverTask({
      owner_email: currentUser.email,
      owner_name: currentUser.full_name,
      assignee_email: newTask.assignee_email,
      assignee_name: assignee?.full_name || newTask.assignee_email,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      request_id: newTask.request_id || undefined,
    });

    toast.success('Handover task created successfully');
    setIsCreateModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignee_email: '',
      priority: 'medium',
      request_id: '',
    });
  };

  const handleAcknowledge = (task: HandoverTask) => {
    updateHandoverTask(task.id, { status: 'acknowledged' });
    toast.success('Task acknowledged');
  };

  const handleStartWorking = (task: HandoverTask) => {
    updateHandoverTask(task.id, { status: 'in_progress' });
    toast.success('Task marked as in progress');
  };

  const handleComplete = (task: HandoverTask) => {
    updateHandoverTask(task.id, {
      status: 'completed',
      completed_date: new Date().toISOString().split('T')[0],
    });
    toast.success('Task marked as completed');
  };

  const handleAddComment = (task: HandoverTask) => {
    if (!newComment.trim() || !currentUser) return;

    const comment: TaskComment = {
      id: `CMT-${Date.now()}`,
      task_id: task.id,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    const existingComments = task.comments || [];
    updateHandoverTask(task.id, {
      comments: [...existingComments, comment]
    });

    setNewComment('');
    // Update selectedTask to show the new comment
    if (selectedTask?.id === task.id) {
      setSelectedTask({
        ...task,
        comments: [...existingComments, comment]
      });
    }
    toast.success('Comment added');
  };

  const handleViewDetails = (task: HandoverTask) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="gap-1 border-blue-300 text-blue-700"><Eye className="h-3 w-3" /> Acknowledged</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="gap-1 border-orange-300 text-orange-700 bg-orange-50"><PlayCircle className="h-3 w-3" /> In Progress</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-600"><CheckCheck className="h-3 w-3" /> Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLeaveInfo = (requestId?: string) => {
    if (!requestId) return null;
    return leaveRequests.find(r => r.request_id === requestId);
  };

  // Stats
  const pendingCount = assignedToMe.filter(t => t.status === 'pending').length;
  const acknowledgedCount = assignedToMe.filter(t => t.status === 'acknowledged').length;
  const inProgressCount = assignedToMe.filter(t => t.status === 'in_progress').length;
  const completedCount = assignedToMe.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Handovers</h1>
          <p className="text-muted-foreground mt-1">
            Manage handover tasks and assignments during leave
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Handover
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Handovers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{myHandovers.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks I've assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{pendingCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting acknowledgment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{inProgressCount + acknowledgedCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{completedCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assigned-to-me" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assigned-to-me" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Assigned to Me ({assignedToMe.length})
          </TabsTrigger>
          <TabsTrigger value="my-handovers" className="gap-2">
            <Send className="h-4 w-4" />
            My Handovers ({myHandovers.length})
          </TabsTrigger>
        </TabsList>

        {/* Assigned to Me Tab */}
        <TabsContent value="assigned-to-me" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Assigned to Me</CardTitle>
              <CardDescription>Handover tasks from colleagues on leave</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedToMe.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Handovers</h3>
                  <p className="text-muted-foreground">
                    You don't have any tasks assigned to you at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedToMe.map(task => {
                    const leaveInfo = getLeaveInfo(task.request_id);
                    return (
                      <div key={task.id} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${task.owner_name}`} />
                              <AvatarFallback>{task.owner_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="font-semibold">{task.title}</h4>
                                <Badge className={getPriorityColor(task.priority)} variant="outline">
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                </Badge>
                                {getStatusBadge(task.status)}
                              </div>

                              <p className="text-sm text-muted-foreground">
                                From: <span className="font-medium">{task.owner_name}</span>
                                {leaveInfo && (
                                  <>
                                    <span className="mx-2">•</span>
                                    During leave: {formatDate(leaveInfo.start_date)} - {formatDate(leaveInfo.end_date)}
                                  </>
                                )}
                              </p>

                              {task.description && (
                                <p className="text-sm line-clamp-2">{task.description}</p>
                              )}

                              <div className="flex gap-2 mt-3 flex-wrap">
                                {task.status === 'pending' && (
                                  <Button size="sm" onClick={() => handleAcknowledge(task)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Acknowledge
                                  </Button>
                                )}
                                {task.status === 'acknowledged' && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleStartWorking(task)}>
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Start Working
                                    </Button>
                                    <Button size="sm" onClick={() => handleComplete(task)}>
                                      <CheckCheck className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </Button>
                                  </>
                                )}
                                {task.status === 'in_progress' && (
                                  <Button size="sm" onClick={() => handleComplete(task)}>
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(task)} className="gap-1">
                                  {task.comments && task.comments.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      {task.comments.length}
                                    </span>
                                  )}
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Handovers Tab */}
        <TabsContent value="my-handovers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Handovers I've Created</CardTitle>
              <CardDescription>Tasks you've assigned to teammates during your leave</CardDescription>
            </CardHeader>
            <CardContent>
              {myHandovers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No Handovers Created</h3>
                  <p className="text-muted-foreground mb-4">
                    Create handover tasks to ensure smooth coverage during your leave.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Handover
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myHandovers.map(task => {
                    const leaveInfo = getLeaveInfo(task.request_id);
                    return (
                      <div key={task.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge className={getPriorityColor(task.priority)} variant="outline">
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                              {getStatusBadge(task.status)}
                            </div>

                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Assigned to: <span className="font-medium">{task.assignee_name}</span>
                            </p>

                            {leaveInfo && (
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Leave period: {formatDate(leaveInfo.start_date)} - {formatDate(leaveInfo.end_date)}
                              </p>
                            )}

                            {task.description && (
                              <p className="text-sm line-clamp-2">{task.description}</p>
                            )}

                            <p className="text-xs text-muted-foreground">
                              Created: {formatDate(task.created_date)}
                              {task.completed_date && ` • Completed: ${formatDate(task.completed_date)}`}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(task)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Handover Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Handover Task</DialogTitle>
            <DialogDescription>
              Assign a task to a colleague to cover during your leave
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Monitor client emails"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Provide details about the task, key contacts, and any important notes..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Assign To *</Label>
                <Select
                  value={newTask.assignee_email}
                  onValueChange={(value) => setNewTask({ ...newTask, assignee_email: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssignees.map(emp => (
                      <SelectItem key={emp.email} value={emp.email}>
                        {emp.full_name} ({emp.team})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {myUpcomingLeaves.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Leave Request (Optional)</Label>
                <Select
                  value={newTask.request_id}
                  onValueChange={(value) => setNewTask({ ...newTask, request_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave request" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No link</SelectItem>
                    {myUpcomingLeaves.map(leave => (
                      <SelectItem key={leave.request_id} value={leave.request_id}>
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({leave.leave_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Handover Task Details</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Badge className={getPriorityColor(selectedTask.priority)} variant="outline">
                  {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)} Priority
                </Badge>
                {getStatusBadge(selectedTask.status)}
              </div>

              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${selectedTask.owner_name}`} />
                    <AvatarFallback>{selectedTask.owner_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Created by</p>
                    <p className="font-medium text-sm">{selectedTask.owner_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${selectedTask.assignee_name}`} />
                    <AvatarFallback>{selectedTask.assignee_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned to</p>
                    <p className="font-medium text-sm">{selectedTask.assignee_name}</p>
                  </div>
                </div>
              </div>

              {selectedTask.description && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {selectedTask.request_id && (() => {
                const leaveInfo = getLeaveInfo(selectedTask.request_id);
                return leaveInfo ? (
                  <div className="p-3 rounded-lg border bg-blue-50/50">
                    <Label className="text-muted-foreground text-xs mb-1 block">Linked Leave Request</Label>
                    <p className="text-sm">
                      {formatDate(leaveInfo.start_date)} - {formatDate(leaveInfo.end_date)}
                      <span className="ml-2 capitalize">({leaveInfo.leave_type} leave)</span>
                    </p>
                  </div>
                ) : null;
              })()}

              <div className="text-xs text-muted-foreground">
                <p>Created: {formatDate(selectedTask.created_date)}</p>
                {selectedTask.completed_date && <p>Completed: {formatDate(selectedTask.completed_date)}</p>}
              </div>

              {/* Comments Section */}
              <div className="space-y-3 border-t pt-4">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({selectedTask.comments?.length || 0})
                </Label>

                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-3">
                      {selectedTask.comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${comment.author_name}`} />
                              <AvatarFallback className="text-xs">{comment.author_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.author_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm ml-8">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">No comments yet</p>
                )}

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(selectedTask)}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDetailModalOpen(false);
              setNewComment('');
            }}>
              Close
            </Button>
            {selectedTask?.assignee_email === currentUser?.email && selectedTask?.status === 'pending' && (
              <Button onClick={() => {
                handleAcknowledge(selectedTask);
                setIsDetailModalOpen(false);
              }}>
                <Eye className="h-4 w-4 mr-2" />
                Acknowledge
              </Button>
            )}
            {selectedTask?.assignee_email === currentUser?.email && selectedTask?.status === 'acknowledged' && (
              <>
                <Button variant="outline" onClick={() => {
                  handleStartWorking(selectedTask);
                }}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Working
                </Button>
                <Button onClick={() => {
                  handleComplete(selectedTask);
                  setIsDetailModalOpen(false);
                }}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </>
            )}
            {selectedTask?.assignee_email === currentUser?.email && selectedTask?.status === 'in_progress' && (
              <Button onClick={() => {
                handleComplete(selectedTask);
                setIsDetailModalOpen(false);
              }}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Handovers;
