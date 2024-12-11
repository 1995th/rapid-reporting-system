import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleAuthorization } from "@/hooks/useRoleAuthorization";
import ReportMetrics from "@/components/analytics/ReportMetrics";
import TotalReports from "@/components/analytics/TotalReports";
import ReportSearch from "@/components/analytics/ReportSearch";
import ReportStatusMetrics from "@/components/analytics/ReportStatusMetrics";

const Analytics = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useRoleAuthorization();

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      navigate('/');
    }
  }, [userProfile, navigate]);

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 max-w-7xl">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Overview of report statistics and metrics
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TotalReports />
          <ReportStatusMetrics />
        </div>
        <ReportMetrics />
        <ReportSearch />
      </div>
    </div>
  );
};

export default Analytics;