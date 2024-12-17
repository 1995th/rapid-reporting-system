import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Organization from "./pages/Organization";
import IncidentReportForm from "./components/IncidentReportForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ReportDetail from "./pages/ReportDetail";
import { SidebarProvider } from "./components/ui/sidebar";
import DesktopSidebar from "./components/layout/DesktopSidebar";
import { useIsMobile } from "./hooks/use-mobile";

const AppRoutes = () => {
  const location = useLocation();
  const isPublicPage = location.pathname === '/auth' || location.pathname === '/';
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {!isPublicPage && (
          <>
            {!isMobile && <DesktopSidebar />}
            {isMobile && <Navbar />}
          </>
        )}
        <main className={`flex-1 ${!isPublicPage ? 'md:pl-4' : ''}`}>
          <div className={`container mx-auto px-4 py-6 mb-16 md:mb-0`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-report"
                element={
                  <ProtectedRoute>
                    <IncidentReportForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-report/:id"
                element={
                  <ProtectedRoute>
                    <IncidentReportForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/:id"
                element={
                  <ProtectedRoute>
                    <ReportDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organization"
                element={
                  <ProtectedRoute>
                    <Organization />
                  </ProtectedRoute>
                }
              />
              <Route path="/index" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppRoutes;