import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportContentProps {
  report: {
    id: string;
    title: string;
    status: string;
    profiles: {
      first_name: string;
      last_name: string;
    };
    incident_date: string;
    description: string;
  };
}

export const ReportContent = ({ report }: ReportContentProps) => {
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["report-categories", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_category_assignments")
        .select(`
          main_categories (
            id,
            name
          ),
          subcategories (
            id,
            name
          ),
          is_primary
        `)
        .eq("report_id", report.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
            {isCategoryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : categoryData ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Main Category:</p>
                <p>{categoryData.main_categories?.name || "Uncategorized"}</p>
                <p className="text-sm text-muted-foreground mt-2">Subcategory:</p>
                <p>{categoryData.subcategories?.name || "None"}</p>
              </div>
            ) : (
              <p>No category assigned</p>
            )}
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