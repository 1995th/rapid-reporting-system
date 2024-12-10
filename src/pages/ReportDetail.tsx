import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const ReportDetail = () => {
  const { id } = useParams();

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          case_categories (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
            <p>{report.case_categories?.name}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
            <Badge
              variant={
                report.status === "resolved"
                  ? "success"
                  : report.status === "in_progress"
                  ? "warning"
                  : "default"
              }
            >
              {report.status}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Reporter</h3>
            <p>
              {report.profiles?.first_name} {report.profiles?.last_name}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Date</h3>
            <p>
              {report.incident_date
                ? format(new Date(report.incident_date), "MMM d, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{report.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportDetail;