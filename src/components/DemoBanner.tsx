import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, X, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DemoBanner = () => {
  const { isDemo, setIsDemo } = useAuth();

  if (!isDemo) return null;

  return (
    <div className="bg-demo-light border-l-4 border-demo px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-5 w-5 text-demo flex-shrink-0" />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-demo">Demo Mode Active</span>
          <span className="text-sm text-muted-foreground">
            This is a training environment. Actions do not affect production data.
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-demo hover:bg-demo/10"
          onClick={() => {
            // Reset demo data
            localStorage.removeItem('leaveRequests');
            localStorage.removeItem('notifications');
            window.location.reload();
          }}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset Demo
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-muted"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Help
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDemo(false)}
          className="text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4 mr-1" />
          Exit Demo
        </Button>
      </div>
    </div>
  );
};
