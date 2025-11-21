import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  RefreshCw,
  Zap,
  Brain,
  Target,
  Shield,
  Heart,
  Lightbulb,
} from 'lucide-react';

const ExecBriefing = () => {
  const { currentUser } = useAuth();
  const { employees, leaveRequests, getOnLeaveToday } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [briefingGenerated, setBriefingGenerated] = useState(false);

  if (!currentUser) return null;

  const handleGenerateBriefing = () => {
    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setBriefingGenerated(true);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 150);
  };

  const onLeaveToday = getOnLeaveToday();
  const totalEmployees = employees.length;
  const capacityPercentage = Math.round(((totalEmployees - onLeaveToday.length) / totalEmployees) * 100);

  // Calculate insights
  const pendingRequests = leaveRequests.filter(r => r.status === 'pending' || r.status === 'pending_hr');
  const declinedThisMonth = leaveRequests.filter(r => {
    const date = new Date(r.request_date);
    const now = new Date();
    return (r.status === 'declined' || r.status === 'hr_declined') && date.getMonth() === now.getMonth();
  });

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
              <h1 className="text-3xl font-bold">Executive AI Briefing</h1>
              <p className="text-muted-foreground mt-1">
                Strategic insights powered by NeverLeft AI
              </p>
            </div>
          </div>
        </div>
        {briefingGenerated && (
          <Button variant="outline" onClick={handleGenerateBriefing} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Briefing
          </Button>
        )}
      </div>

      {!briefingGenerated ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto animate-pulse">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Analyzing organization data...</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Generating strategic insights from leave patterns, team capacity, and workforce trends.
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
                <h3 className="text-xl font-semibold">Good morning, {currentUser.full_name.split(' ')[0]}!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Get AI-powered strategic insights about your organization's workforce health, leave trends, and actionable recommendations.
                </p>
                <Button onClick={handleGenerateBriefing} size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                  <Zap className="h-5 w-5" />
                  Generate Executive Briefing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Executive Summary */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Executive Summary
              </CardTitle>
              <CardDescription>AI-generated overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed">
                Good morning, <strong>{currentUser.full_name.split(' ')[0]}</strong>. Your organization is currently operating at
                <span className={`font-bold mx-1 ${capacityPercentage >= 80 ? 'text-green-600' : capacityPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {capacityPercentage}% capacity
                </span>
                with {onLeaveToday.length} team members on leave today.
                {pendingRequests.length > 0 && (
                  <span> There are <strong>{pendingRequests.length} pending leave requests</strong> awaiting approval.</span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Workforce Healthy
                </Badge>
                {capacityPercentage < 80 && (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Capacity Watch
                  </Badge>
                )}
                <Badge className="bg-blue-100 text-blue-700">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingRequests.length} Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Key Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Leave Usage Up 12%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    November shows increased leave requests compared to October, typical for year-end planning.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Customer Success Team Strong</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    CS team maintains 95% capacity with good leave distribution throughout Q4.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">December Peak Expected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Predictive analysis shows 35% of remaining annual leave will be taken in December.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">Encourage Early Planning</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send a reminder to employees with 8+ days remaining to plan their December leave early.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-green-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Coverage Planning</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ensure critical roles have backup coverage during the Dec 23-Jan 3 period.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Wellness Check</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    3 employees show signs of potential burnout. Consider proactive wellness outreach.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Priority Actions
              </CardTitle>
              <CardDescription>Recommended executive actions based on current data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Review pending HR approvals</p>
                    <p className="text-sm text-muted-foreground">{pendingRequests.filter(r => r.status === 'pending_hr').length} requests waiting for final approval</p>
                  </div>
                  <Badge variant="destructive">High Priority</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Plan December coverage strategy</p>
                    <p className="text-sm text-muted-foreground">Ensure business continuity during holiday period</p>
                  </div>
                  <Badge variant="secondary">Medium Priority</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Send company-wide leave reminder</p>
                    <p className="text-sm text-muted-foreground">Encourage use-it-or-lose-it leave before year end</p>
                  </div>
                  <Badge variant="outline">Suggested</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExecBriefing;
