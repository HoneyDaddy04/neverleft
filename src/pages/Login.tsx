import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { User, Users, Shield, Crown } from 'lucide-react';

const Login = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: 'employee' | 'teamLead' | 'hr' | 'exec') => {
    loginAs(role);
    navigate('/');
  };

  const accounts = [
    {
      role: 'employee' as const,
      account: DEMO_ACCOUNTS.employee,
      icon: User,
      description: 'Customer Success Manager - manage clients, submit leave requests, track handovers',
      color: 'bg-blue-500',
    },
    {
      role: 'teamLead' as const,
      account: DEMO_ACCOUNTS.teamLead,
      icon: Users,
      description: 'Customer Success Lead - approve team requests, manage capacity, coach team',
      color: 'bg-purple-500',
    },
    {
      role: 'hr' as const,
      account: DEMO_ACCOUNTS.hr,
      icon: Shield,
      description: 'HR Admin - final approvals, policy management, company-wide oversight',
      color: 'bg-green-500',
    },
    {
      role: 'exec' as const,
      account: DEMO_ACCOUNTS.exec,
      icon: Crown,
      description: 'CEO - strategic KPIs, org health metrics, executive insights & AI briefings',
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/curacel favicon.jpg"
              alt="Curacel"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <h1 className="text-4xl font-bold text-white">NeverLeft</h1>
          </div>
          <p className="text-slate-400 text-lg">Leave Management by Curacel</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Choose Your View</CardTitle>
            <CardDescription className="text-slate-400">
              Select a pre-configured account to explore the system with real data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {accounts.map(({ role, account, icon: Icon, description, color }) => (
                <button
                  key={role}
                  onClick={() => handleLogin(role)}
                  className="group relative p-6 rounded-xl border border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 text-left"
                >
                  <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={account.profile_image} />
                      <AvatarFallback>{account.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{account.full_name}</p>
                      <p className="text-sm text-slate-400">{account.role}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className="mb-3 text-slate-300 border-slate-500">
                    {account.team}
                  </Badge>

                  <p className="text-sm text-slate-400 mb-4">{description}</p>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Click to sign in
                  </div>

                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/10 transition-all duration-200"></div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-slate-700/30 border border-slate-600">
              <h3 className="text-sm font-medium text-white mb-2">About This Demo</h3>
              <p className="text-sm text-slate-400">
                This is a fully functional leave management system with pre-populated data.
                All actions you take (approvals, leave requests, handovers) will work in real-time.
                The data resets when you refresh the page.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Powered by the same workflow as the Slack/n8n integration
        </p>
      </div>
    </div>
  );
};

export default Login;
