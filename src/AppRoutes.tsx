import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import IncidentReportForm from "./components/IncidentReportForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ReportDetail from "./pages/ReportDetail";

const AppRoutes = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={`container mx-auto px-4 ${isAuthPage ? '' : 'py-6'}`}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
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
        </Routes>
      </main>
    </>
  );
};

export default AppRoutes;