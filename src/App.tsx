import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveHistory from "./pages/LeaveHistory";
import Handovers from "./pages/Handovers";
import TeamRequests from "./pages/TeamRequests";
import TeamApprovals from "./pages/TeamApprovals";
import TeamCalendar from "./pages/TeamCalendar";
import HRRequests from "./pages/HRRequests";
import HRQueries from "./pages/HRQueries";
import CapacityInsights from "./pages/CapacityInsights";
import Settings from "./pages/Settings";
import AICatchup from "./pages/AICatchup";
import ExecDashboard from "./pages/ExecDashboard";
import ExecBriefing from "./pages/ExecBriefing";
import OrgHealth from "./pages/OrgHealth";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import PolicyManagement from "./pages/admin/PolicyManagement";
import HolidaysManagement from "./pages/admin/HolidaysManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave/request"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <LeaveRequest />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave/history"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <LeaveHistory />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/handovers"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Handovers />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/requests"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <TeamRequests />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/approvals"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <TeamApprovals />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/calendar"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <TeamCalendar />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/requests"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <HRRequests />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/capacity"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CapacityInsights />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/catchup"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AICatchup />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Executive routes */}
      <Route
        path="/exec"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ExecDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exec/briefing"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ExecBriefing />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exec/health"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <OrgHealth />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* HR/Admin routes */}
      <Route
        path="/hr/queries"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <HRQueries />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <EmployeeManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/policies"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <PolicyManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/holidays"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <HolidaysManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <NotFound />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
