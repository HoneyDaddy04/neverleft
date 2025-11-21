import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sparkles,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  ChevronRight,
  Star,
  Bell,
} from 'lucide-react';
import { formatDate } from '@/lib/mockData';

// Role-specific catchup data generator
const generateCatchupData = (userName: string, userRole: string, leaveStartDate: string, leaveEndDate: string) => {
  // Executive-level catchup
  if (userRole === 'Exec') {
    return {
      summary: {
        totalItems: 89,
        criticalItems: 5,
        meetingsMissed: 12,
        emailThreads: 45,
        slackMentions: 28,
        documentsUpdated: 14,
      },
      criticalUpdates: [
        {
          id: '1',
          type: 'board',
          priority: 'high',
          title: 'Board Meeting Follow-up Required',
          description: 'Board members requesting updated Q4 projections and 2026 strategy deck by Friday.',
          source: 'Email from Board Chair',
          timestamp: '1 day ago',
          action: 'Prepare materials',
        },
        {
          id: '2',
          type: 'investor',
          priority: 'high',
          title: 'Series B Discussion - Sequoia',
          description: 'Sequoia partners reached out for follow-up call. Initial interest in leading the round.',
          source: 'Email from VC Relations',
          timestamp: '2 days ago',
          action: 'Schedule call',
        },
        {
          id: '3',
          type: 'org',
          priority: 'high',
          title: 'Key Hire Decision Pending',
          description: 'Final interview completed for VP Engineering. Offer decision needed by tomorrow.',
          source: 'HR Escalation',
          timestamp: '1 day ago',
          action: 'Review candidate',
        },
        {
          id: '4',
          type: 'strategic',
          priority: 'medium',
          title: 'Partnership Opportunity - Flutterwave',
          description: 'Flutterwave CEO proposed strategic partnership discussion. Could accelerate payments expansion.',
          source: 'Email from Partnerships',
          timestamp: '3 days ago',
          action: 'Review proposal',
        },
        {
          id: '5',
          type: 'escalation',
          priority: 'medium',
          title: 'Enterprise Client Risk - GTBank',
          description: 'GTBank renewal at risk due to pricing concerns. Account team requesting executive involvement.',
          source: 'Slack #enterprise-deals',
          timestamp: '2 days ago',
          action: 'Call with client',
        },
      ],
      meetings: [
        {
          id: 'm1',
          title: 'Executive Leadership Team Weekly',
          date: '2025-11-18',
          summary: 'Discussed Q4 targets, headcount planning, and 2026 OKRs. Engineering capacity concerns raised.',
          keyDecisions: ['Approved 5 additional engineering hires', 'Delayed Lagos office expansion to Q2'],
          attendees: ['All C-Suite', 'VP Engineering', 'VP Sales'],
          recordingUrl: '#',
        },
        {
          id: 'm2',
          title: 'All-Hands Company Meeting',
          date: '2025-11-19',
          summary: 'Shared Q3 results (exceeded targets by 15%). Announced new product roadmap priorities.',
          keyDecisions: ['Launched "Customer First" initiative', 'Q4 bonus structure confirmed'],
          attendees: ['All Employees'],
          recordingUrl: '#',
        },
        {
          id: 'm3',
          title: 'Board Strategy Session',
          date: '2025-11-20',
          summary: 'Preliminary 2026 strategy review. Board supportive of expansion plans with caveats.',
          keyDecisions: ['Approved Nigeria market doubling-down', 'Requested deeper Kenya analysis'],
          attendees: ['Board Members', 'CEO', 'CFO'],
          recordingUrl: '#',
        },
      ],
      slackHighlights: [
        {
          id: 's1',
          channel: '#leadership',
          message: 'Q3 revenue numbers finalized - we hit 127% of target! Team celebration planned for Friday.',
          author: 'CFO',
          timestamp: '2025-11-19 09:00',
          reactions: 45,
        },
        {
          id: 's2',
          channel: '#exec-private',
          message: `@${userName.split(' ')[0]} - Need your input on the Sequoia term sheet before Thursday EOD.`,
          author: 'CFO',
          timestamp: '2025-11-18 16:30',
          reactions: 0,
        },
        {
          id: 's3',
          channel: '#general',
          message: 'Welcome to our 5 new team members joining this week across Engineering and Customer Success!',
          author: 'HR',
          timestamp: '2025-11-20 10:00',
          reactions: 67,
        },
      ],
      emailDigest: [
        {
          id: 'e1',
          subject: 'Sequoia - Series B Term Sheet Draft',
          from: 'Legal / VC Relations',
          preview: 'Attached is the draft term sheet from Sequoia. Key terms look favorable but...',
          importance: 'high',
          threadLength: 8,
        },
        {
          id: 'e2',
          subject: 'Re: GTBank Enterprise Renewal',
          from: 'VP Sales',
          preview: 'Client is pushing back on the 20% increase. Recommending we offer 12% with extended term...',
          importance: 'high',
          threadLength: 12,
        },
        {
          id: 'e3',
          subject: 'Monthly Investor Update - November',
          from: 'CFO',
          preview: 'Draft of November investor update attached. Please review before we send Friday...',
          importance: 'medium',
          threadLength: 3,
        },
      ],
      documentChanges: [
        {
          id: 'd1',
          name: '2026 Strategic Plan - Draft v3',
          type: 'Google Doc',
          changes: 'Major updates to market expansion section and financial projections',
          editor: 'Chief Strategy Officer',
          timestamp: '2025-11-19',
        },
        {
          id: 'd2',
          name: 'Board Deck - Q4 2025',
          type: 'Google Slides',
          changes: 'Added competitive analysis and updated ARR projections',
          editor: 'CFO',
          timestamp: '2025-11-20',
        },
        {
          id: 'd3',
          name: 'Org Chart - Proposed 2026',
          type: 'Lucidchart',
          changes: 'New VP-level positions and team restructuring',
          editor: 'CHRO',
          timestamp: '2025-11-18',
        },
      ],
      recommendations: [
        'Review and respond to Sequoia term sheet - time sensitive',
        'Make VP Engineering hire decision before candidate deadline',
        'Call GTBank stakeholders to save enterprise renewal',
        'Watch All-Hands recording to align on company messaging',
        'Review and approve monthly investor update',
        'Schedule call with Flutterwave CEO for partnership discussion',
      ],
    };
  }

  // Team Lead / HR level catchup
  if (userRole === 'TeamLead' || userRole === 'HR' || userRole === 'Admin') {
    return {
      summary: {
        totalItems: 63,
        criticalItems: 4,
        meetingsMissed: 10,
        emailThreads: 32,
        slackMentions: 18,
        documentsUpdated: 8,
      },
      criticalUpdates: [
        {
          id: '1',
          type: 'team',
          priority: 'high',
          title: 'Team Member PIP Follow-up',
          description: 'Performance improvement plan check-in due for Chidi. HR needs your assessment by Friday.',
          source: 'HR Notification',
          timestamp: '1 day ago',
          action: 'Submit assessment',
        },
        {
          id: '2',
          type: 'approval',
          priority: 'high',
          title: '3 Leave Requests Pending',
          description: 'Team members awaiting your approval for December holiday leave.',
          source: 'NeverLeft System',
          timestamp: '2 days ago',
          action: 'Review requests',
        },
        {
          id: '3',
          type: 'escalation',
          priority: 'high',
          title: 'Client Escalation - Access Bank',
          description: 'Access Bank raised SLA concerns. Amina handled initial response but needs your guidance.',
          source: 'Slack #client-escalations',
          timestamp: '2 days ago',
          action: 'Review and advise',
        },
        {
          id: '4',
          type: 'planning',
          priority: 'medium',
          title: 'Q1 Capacity Planning Due',
          description: 'Submit team capacity forecast and hiring needs for Q1 2026.',
          source: 'Email from HR',
          timestamp: '3 days ago',
          action: 'Complete forecast',
        },
      ],
      meetings: [
        {
          id: 'm1',
          title: 'Team Weekly Standup',
          date: '2025-11-18',
          summary: 'Sprint progress on track. Discussed client feedback and upcoming deliverables.',
          keyDecisions: ['Reassigned 2 tickets to balance workload', 'Approved Amina to lead Access Bank response'],
          attendees: ['All CS Team Members'],
          recordingUrl: '#',
        },
        {
          id: 'm2',
          title: 'Leadership Sync',
          date: '2025-11-19',
          summary: 'Cross-team alignment on Q4 goals. Discussed holiday coverage planning.',
          keyDecisions: ['Minimum 60% coverage required Dec 23-Jan 3', 'Cross-training initiative approved'],
          attendees: ['All Team Leads', 'HR'],
          recordingUrl: '#',
        },
        {
          id: 'm3',
          title: '1:1 - Amina (covered by HR)',
          date: '2025-11-20',
          summary: 'Amina expressed interest in senior role. Discussed development plan.',
          keyDecisions: ['Identify stretch project for Q1', 'Schedule mentorship with senior CS member'],
          attendees: ['Amina Okoro', 'HR Rep'],
          recordingUrl: '#',
        },
      ],
      slackHighlights: [
        {
          id: 's1',
          channel: '#cs-team',
          message: 'Great work everyone on the Access Bank situation! They sent a thank you note.',
          author: 'Amina Okoro',
          timestamp: '2025-11-20 15:00',
          reactions: 8,
        },
        {
          id: 's2',
          channel: '#team-leads',
          message: `@${userName.split(' ')[0]} - Can we discuss the Q1 hiring plan when you're back? Have some thoughts.`,
          author: 'VP Operations',
          timestamp: '2025-11-18 11:30',
          reactions: 0,
        },
        {
          id: 's3',
          channel: '#general',
          message: 'Reminder: Holiday leave requests for December should be submitted by Nov 25th.',
          author: 'HR',
          timestamp: '2025-11-19 09:00',
          reactions: 15,
        },
      ],
      emailDigest: [
        {
          id: 'e1',
          subject: 'Q1 2026 Capacity Planning Template',
          from: 'HR',
          preview: 'Please complete the attached capacity planning template for your team by...',
          importance: 'high',
          threadLength: 2,
        },
        {
          id: 'e2',
          subject: 'Re: Team Performance Review Schedule',
          from: 'VP Operations',
          preview: 'Annual reviews will be conducted Dec 1-15. Please prepare assessments for...',
          importance: 'medium',
          threadLength: 4,
        },
        {
          id: 'e3',
          subject: 'Cross-Training Initiative - Sign Up',
          from: 'HR Learning',
          preview: 'New cross-training program launching in January. Nominate team members...',
          importance: 'low',
          threadLength: 1,
        },
      ],
      documentChanges: [
        {
          id: 'd1',
          name: 'CS Team - Q4 OKRs Tracker',
          type: 'Google Sheet',
          changes: 'Updated progress metrics and added new client success milestones',
          editor: 'Amina Okoro',
          timestamp: '2025-11-19',
        },
        {
          id: 'd2',
          name: 'Holiday Coverage Schedule Template',
          type: 'Google Sheet',
          changes: 'New template for December coverage planning',
          editor: 'HR',
          timestamp: '2025-11-18',
        },
      ],
      recommendations: [
        'Review and approve pending leave requests - team is waiting',
        'Check in with Amina about Access Bank escalation resolution',
        'Complete Q1 capacity planning before deadline',
        'Review PIP documentation and prepare HR assessment',
        'Watch Leadership Sync recording for holiday coverage requirements',
      ],
    };
  }

  // Default: Employee-level catchup
  return {
    summary: {
      totalItems: 47,
      criticalItems: 3,
      meetingsMissed: 8,
      emailThreads: 23,
      slackMentions: 12,
      documentsUpdated: 4,
    },
    criticalUpdates: [
      {
        id: '1',
        type: 'task',
        priority: 'high',
        title: 'Client Deliverable Due Tomorrow',
        description: 'The monthly report for First Bank is due tomorrow. Chidi started it but needs your input.',
        source: 'Slack from Team Lead',
        timestamp: '1 day ago',
        action: 'Complete report',
      },
      {
        id: '2',
        type: 'meeting',
        priority: 'high',
        title: 'Rescheduled Client Call',
        description: 'Your call with Zenith Bank was moved to Wednesday 10am. Prep notes attached.',
        source: 'Calendar Update',
        timestamp: '2 days ago',
        action: 'Review prep notes',
      },
      {
        id: '3',
        type: 'team',
        priority: 'medium',
        title: 'Team Coverage Request',
        description: 'Chidi asked if you can cover his accounts on Dec 5th while he attends training.',
        source: 'Slack DM',
        timestamp: '3 days ago',
        action: 'Respond to Chidi',
      },
    ],
    meetings: [
      {
        id: 'm1',
        title: 'Weekly Team Standup',
        date: '2025-11-18',
        summary: 'Sprint progress review. Team discussed client feedback and workload distribution.',
        keyDecisions: ['New client onboarding process approved', 'Shared best practices for SLA management'],
        attendees: ['Kabir (Lead)', 'Chidi', 'Ngozi', 'You (excused)'],
        recordingUrl: '#',
      },
      {
        id: 'm2',
        title: 'CS Skills Workshop',
        date: '2025-11-19',
        summary: 'Training on handling difficult client conversations. Good tips shared.',
        keyDecisions: ['New escalation script template available', 'Role-play sessions to continue monthly'],
        attendees: ['CS Team', 'External Trainer'],
        recordingUrl: '#',
      },
      {
        id: 'm3',
        title: 'First Bank Monthly Review',
        date: '2025-11-20',
        summary: 'Kabir covered for you. Client satisfied with October performance. New requests discussed.',
        keyDecisions: ['Additional reporting requested for Q1', 'Quarterly business review scheduled for January'],
        attendees: ['Kabir', 'First Bank Team'],
        recordingUrl: '#',
      },
    ],
    slackHighlights: [
      {
        id: 's1',
        channel: '#cs-team',
        message: 'New client onboarding checklist is live! Please review and use for all new accounts.',
        author: 'Kabir Adebayo',
        timestamp: '2025-11-19 14:30',
        reactions: 6,
      },
      {
        id: 's2',
        channel: '#general',
        message: `Hey @${userName.split(' ')[0]}, hope you had a great break! Let me know when you're caught up.`,
        author: 'Chidi Okonkwo',
        timestamp: '2025-11-18 10:15',
        reactions: 2,
      },
      {
        id: 's3',
        channel: '#cs-team',
        message: 'Great news - Access Bank just renewed for another year! Team effort paid off.',
        author: 'Kabir Adebayo',
        timestamp: '2025-11-20 16:00',
        reactions: 12,
      },
    ],
    emailDigest: [
      {
        id: 'e1',
        subject: 'First Bank - Monthly Report Materials',
        from: 'Chidi Okonkwo',
        preview: 'I started the First Bank report while you were out. Can you add the usage analytics section...',
        importance: 'high',
        threadLength: 3,
      },
      {
        id: 'e2',
        subject: 'Holiday Leave Reminder - Submit by Nov 25',
        from: 'HR',
        preview: 'Reminder to submit your December holiday leave requests by November 25th...',
        importance: 'medium',
        threadLength: 1,
      },
      {
        id: 'e3',
        subject: 'Team Lunch Friday!',
        from: 'Kabir Adebayo',
        preview: 'Celebrating Access Bank renewal with team lunch at 12pm Friday. Hope you can join...',
        importance: 'low',
        threadLength: 5,
      },
    ],
    documentChanges: [
      {
        id: 'd1',
        name: 'Client Onboarding Checklist v2',
        type: 'Google Doc',
        changes: 'Updated process with new compliance requirements',
        editor: 'Kabir Adebayo',
        timestamp: '2025-11-19',
      },
      {
        id: 'd2',
        name: 'First Bank - October Report Draft',
        type: 'Google Doc',
        changes: 'Chidi started draft - needs your analytics section',
        editor: 'Chidi Okonkwo',
        timestamp: '2025-11-18',
      },
    ],
    recommendations: [
      'Complete the First Bank report section - deadline is tomorrow',
      'Review prep notes for Zenith Bank call on Wednesday',
      'Respond to Chidi about December 5th coverage',
      'Watch the CS Skills Workshop recording for new escalation techniques',
      'Submit your December holiday leave request before Nov 25th deadline',
    ],
  };
};

const AICatchup = () => {
  const { currentUser } = useAuth();
  const { leaveRequests } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [catchupData, setCatchupData] = useState<ReturnType<typeof generateCatchupData> | null>(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Get all approved leaves for this user (past leaves only)
  const today = new Date().toISOString().split('T')[0];
  const myApprovedLeaves = leaveRequests
    .filter(r => r.email === currentUser.email && r.status === 'approved' && r.end_date <= today)
    .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

  // Selected leave (default to most recent)
  const selectedLeave = selectedLeaveId
    ? myApprovedLeaves.find(l => l.request_id === selectedLeaveId)
    : myApprovedLeaves[0];

  const handleGenerateCatchup = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate AI processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setCatchupData(generateCatchupData(
            currentUser.full_name,
            currentUser.user_role,
            selectedLeave?.start_date || '2025-11-15',
            selectedLeave?.end_date || '2025-11-20'
          ));
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">NeverLeft AI Catchup</h1>
              <p className="text-muted-foreground mt-1">
                Get up to speed on what you missed during your leave
              </p>
            </div>
          </div>
        </div>
        {catchupData && (
          <Button variant="outline" onClick={handleGenerateCatchup} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        )}
      </div>

      {/* Leave Selector */}
      {myApprovedLeaves.length > 0 ? (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium mb-2">Select Leave to Catch Up On</p>
                  <select
                    value={selectedLeaveId || selectedLeave?.request_id || ''}
                    onChange={(e) => {
                      setSelectedLeaveId(e.target.value);
                      setCatchupData(null); // Reset catchup data when changing leave
                    }}
                    className="text-sm border rounded-md px-3 py-2 bg-white min-w-[280px]"
                  >
                    {myApprovedLeaves.map((leave) => (
                      <option key={leave.request_id} value={leave.request_id}>
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({leave.days_requested} days, {leave.leave_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedLeave && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {selectedLeave.leave_type} leave
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-medium">No Past Leaves Found</p>
                <p className="text-sm text-muted-foreground">
                  You don't have any completed leaves to catch up on yet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button or Results */}
      {!catchupData ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto animate-pulse">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Analyzing your missed updates...</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Scanning emails, Slack messages, meeting notes, and documents to create your personalized catchup summary.
                </p>
                <div className="max-w-xs mx-auto">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-fit mx-auto">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Welcome Back!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Let NeverLeft AI analyze your emails, Slack conversations, meeting notes, and documents to give you a comprehensive summary of what happened while you were away.
                </p>
                <Button onClick={handleGenerateCatchup} size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Zap className="h-5 w-5" />
                  Generate My Catchup Summary
                </Button>
                <p className="text-xs text-muted-foreground">
                  Sources: Gmail, Slack, Google Calendar, Google Docs, Confluence
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{catchupData.summary.totalItems}</div>
                <p className="text-sm text-muted-foreground">Total Updates</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-red-600">{catchupData.summary.criticalItems}</div>
                <p className="text-sm text-red-600">Critical Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{catchupData.summary.meetingsMissed}</div>
                <p className="text-sm text-muted-foreground">Meetings Missed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{catchupData.summary.emailThreads}</div>
                <p className="text-sm text-muted-foreground">Email Threads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{catchupData.summary.slackMentions}</div>
                <p className="text-sm text-muted-foreground">Slack Mentions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{catchupData.summary.documentsUpdated}</div>
                <p className="text-sm text-muted-foreground">Docs Updated</p>
              </CardContent>
            </Card>
          </div>

          {/* Critical Updates */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Critical Updates - Action Required
              </CardTitle>
              <CardDescription>These items need your immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {catchupData.criticalUpdates.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${getPriorityColor(item.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          <span className="font-semibold">{item.title}</span>
                        </div>
                        <p className="text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.source} · {item.timestamp}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        {item.action}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Suggested order to tackle your catchup</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {catchupData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs defaultValue="meetings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meetings" className="gap-2">
                <Video className="h-4 w-4" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="slack" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Slack
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meetings">
              <Card>
                <CardHeader>
                  <CardTitle>Missed Meetings Summary</CardTitle>
                  <CardDescription>Key decisions and outcomes from meetings during your leave</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {catchupData.meetings.map((meeting) => (
                      <div key={meeting.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(meeting.date)}</p>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Video className="h-3 w-3" />
                            Watch Recording
                          </Button>
                        </div>
                        <p className="text-sm mb-3">{meeting.summary}</p>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Key Decisions:</p>
                          <ul className="text-sm space-y-1">
                            {meeting.keyDecisions.map((decision, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {decision}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {meeting.attendees.join(', ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="slack">
              <Card>
                <CardHeader>
                  <CardTitle>Slack Highlights</CardTitle>
                  <CardDescription>Important messages and mentions from Slack</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {catchupData.slackHighlights.map((msg) => (
                      <div key={msg.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/9.x/personas/svg?seed=${msg.author}`} />
                            <AvatarFallback>{msg.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{msg.author}</span>
                              <Badge variant="outline" className="text-xs">{msg.channel}</Badge>
                              <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                            {msg.reactions > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Star className="h-3 w-3" />
                                {msg.reactions} reactions
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email Digest</CardTitle>
                  <CardDescription>Important email threads requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {catchupData.emailDigest.map((email) => (
                      <div key={email.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          {getImportanceIcon(email.importance)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{email.subject}</span>
                              <Badge variant="outline" className="text-xs">
                                {email.threadLength} messages
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">From: {email.from}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{email.preview}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs">
              <Card>
                <CardHeader>
                  <CardTitle>Document Changes</CardTitle>
                  <CardDescription>Documents that were updated during your leave</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {catchupData.documentChanges.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm">{doc.name}</h4>
                              <p className="text-xs text-muted-foreground">{doc.type}</p>
                              <p className="text-sm mt-1">{doc.changes}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Updated by {doc.editor} · {formatDate(doc.timestamp)}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View Changes</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AICatchup;
