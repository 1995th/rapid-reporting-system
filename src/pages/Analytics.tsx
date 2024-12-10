import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleAuthorization } from "@/hooks/useRoleAuthorization";
import ReportMetrics from "@/components/analytics/ReportMetrics";
import TotalReports from "@/components/analytics/TotalReports";

const Analytics = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useRoleAuthorization();

  // Redirect non-admin users
  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      navigate('/');
    }
  }, [userProfile, navigate]);

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of report statistics and metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TotalReports />
      </div>

      <div className="grid gap-6">
        <ReportMetrics />
      </div>
    </div>
  );
};

export default Analytics;