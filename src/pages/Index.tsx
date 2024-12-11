import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const session = useSession();
  const navigate = useNavigate();

  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["user-reports", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          title,
          status,
          created_at,
          report_category_assignments!inner (
            main_categories (
              name
            )
          )
        `)
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["officer-metrics", session?.user?.id],
    queryFn: async () => {
      const { data: reportCounts, error: countsError } = await supabase
        .from("reports")
        .select("status", { count: "exact" })
        .eq("user_id", session?.user?.id);

      if (countsError) throw countsError;

      const counts = {
        total: reportCounts?.length || 0,
        pending: reportCounts?.filter(r => r.status === "pending").length || 0,
        approved: reportCounts?.filter(r => r.status === "approved").length || 0,
        rejected: reportCounts?.filter(r => r.status === "rejected").length || 0,
      };

      return counts;
    },
    enabled: !!session?.user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const renderReportsList = (status: string) => {
    const filteredReports = reports?.filter(report => report.status === status) || [];

    if (filteredReports.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>No {status} reports</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredReports.slice(0, 3).map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/reports/${report.id}`)}
          >
            <div className="space-y-1">
              <p className="font-medium">{report.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {format(new Date(report.created_at), "MMM d, yyyy")}
                </span>
                <span>•</span>
                <span>
                  {report.report_category_assignments[0]?.main_categories?.name}
                </span>
              </div>
            </div>
            <Badge className={getStatusColor(report.status)}>
              {report.status}
            </Badge>
          </div>
        ))}
        {filteredReports.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/analytics")}
          >
            View All {status} Reports
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Officer Dashboard</h1>
        <Button onClick={() => navigate("/submit-report")}>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.pending}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.approved}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Reports</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.rejected}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports by Status */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              renderReportsList("pending")
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              renderReportsList("approved")
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              renderReportsList("rejected")
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;