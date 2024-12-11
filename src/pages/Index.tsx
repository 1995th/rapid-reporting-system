import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Plus, FileText, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const session = useSession();
  const navigate = useNavigate();

  const { data: recentReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["recent-reports", session?.user?.id],
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
        .order("created_at", { ascending: false })
        .limit(5);

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
        resolved: reportCounts?.filter(r => r.status === "resolved").length || 0,
      };

      return counts;
    },
    enabled: !!session?.user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
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
      <div className="grid gap-4 md:grid-cols-3">
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
            <Clock className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.resolved}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentReports?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reports submitted yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/submit-report")}
              >
                Submit your first report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports?.map((report) => (
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
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/analytics")}
                >
                  View All Reports
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;