import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { QueryCategory } from '@/types';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  FileQuestion,
  CreditCard,
  Users,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categoryLabels: Record<QueryCategory, { label: string; icon: React.ReactNode }> = {
  leave_policy: { label: 'Leave Policy', icon: <Calendar className="h-4 w-4" /> },
  benefits: { label: 'Benefits', icon: <Users className="h-4 w-4" /> },
  payroll: { label: 'Payroll', icon: <CreditCard className="h-4 w-4" /> },
  general: { label: 'General', icon: <HelpCircle className="h-4 w-4" /> },
  complaint: { label: 'Complaint', icon: <AlertCircle className="h-4 w-4" /> },
  other: { label: 'Other', icon: <FileQuestion className="h-4 w-4" /> },
};

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800', icon: <Clock className="h-3 w-3" /> },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
};

export default function Support() {
  const { currentUser } = useAuth();
  const { getMySupportQueries, createSupportQuery } = useData();
  const { toast } = useToast();

  const [showNewQueryDialog, setShowNewQueryDialog] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState({
    category: '' as QueryCategory | '',
    subject: '',
    message: '',
  });

  const myQueries = currentUser ? getMySupportQueries(currentUser.email) : [];
  const openQueries = myQueries.filter(q => q.status !== 'resolved');
  const resolvedQueries = myQueries.filter(q => q.status === 'resolved');

  const selectedQueryData = myQueries.find(q => q.id === selectedQuery);

  const handleSubmitQuery = () => {
    if (!currentUser || !newQuery.category || !newQuery.subject || !newQuery.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields before submitting.',
        variant: 'destructive',
      });
      return;
    }

    createSupportQuery({
      from_email: currentUser.email,
      from_name: currentUser.full_name,
      category: newQuery.category as QueryCategory,
      subject: newQuery.subject,
      message: newQuery.message,
    });

    toast({
      title: 'Query Submitted',
      description: 'Your query has been sent to HR. You will be notified when they respond.',
    });

    setNewQuery({ category: '', subject: '', message: '' });
    setShowNewQueryDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Support</h1>
          <p className="text-muted-foreground">
            Submit queries to HR and track responses
          </p>
        </div>
        <Button onClick={() => setShowNewQueryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Query
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myQueries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openQueries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedQueries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Queries List */}
      <Card>
        <CardHeader>
          <CardTitle>My Queries</CardTitle>
          <CardDescription>
            View and track your submitted queries to HR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({myQueries.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({openQueries.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedQueries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <QueryList queries={myQueries} onSelect={setSelectedQuery} />
            </TabsContent>
            <TabsContent value="open" className="mt-4">
              <QueryList queries={openQueries} onSelect={setSelectedQuery} />
            </TabsContent>
            <TabsContent value="resolved" className="mt-4">
              <QueryList queries={resolvedQueries} onSelect={setSelectedQuery} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Query Dialog */}
      <Dialog open={showNewQueryDialog} onOpenChange={setShowNewQueryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit New Query</DialogTitle>
            <DialogDescription>
              Send a question or request to the HR team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newQuery.category}
                onValueChange={(value) => setNewQuery({ ...newQuery, category: value as QueryCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, { label, icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {icon}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your query"
                value={newQuery.subject}
                onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Provide details about your query..."
                rows={5}
                value={newQuery.message}
                onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewQueryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuery}>
              <Send className="h-4 w-4 mr-2" />
              Submit Query
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Query Detail Dialog */}
      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedQueryData && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className={statusConfig[selectedQueryData.status].color}>
                    {statusConfig[selectedQueryData.status].icon}
                    <span className="ml-1">{statusConfig[selectedQueryData.status].label}</span>
                  </Badge>
                  <Badge variant="outline">
                    {categoryLabels[selectedQueryData.category].icon}
                    <span className="ml-1">{categoryLabels[selectedQueryData.category].label}</span>
                  </Badge>
                </div>
                <DialogTitle className="mt-2">{selectedQueryData.subject}</DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedQueryData.created_at), 'PPP')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Original Query */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">YOUR QUERY</Label>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">{selectedQueryData.message}</p>
                  </div>
                </div>

                {/* Response */}
                {selectedQueryData.response ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">HR RESPONSE</Label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://api.dicebear.com/9.x/avataaars/svg?skinColor=brown,darkBrown,black&seed=${selectedQueryData.responded_by_name}`}
                          />
                          <AvatarFallback>HR</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{selectedQueryData.responded_by_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedQueryData.responded_at && format(new Date(selectedQueryData.responded_at), 'PPP')}
                        </span>
                      </div>
                      <p className="text-sm">{selectedQueryData.response}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 rounded-lg p-4">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Awaiting response from HR...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Query List Component
function QueryList({
  queries,
  onSelect,
}: {
  queries: ReturnType<typeof useData>['supportQueries'];
  onSelect: (id: string) => void;
}) {
  if (queries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No queries found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queries.map((query) => (
        <div
          key={query.id}
          className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onSelect(query.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={statusConfig[query.status].color + ' text-xs'}>
                  {statusConfig[query.status].icon}
                  <span className="ml-1">{statusConfig[query.status].label}</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[query.category].label}
                </Badge>
              </div>
              <h4 className="font-medium truncate">{query.subject}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {query.message}
              </p>
            </div>
            <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
              {format(new Date(query.created_at), 'MMM d, yyyy')}
            </div>
          </div>
          {query.response && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Response received from {query.responded_by_name}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
