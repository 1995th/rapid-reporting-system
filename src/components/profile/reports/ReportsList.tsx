import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Report } from "@/components/analytics/types";

interface ReportsListProps {
  reports: Report[];
}

export const ReportsList = ({ reports }: ReportsListProps) => {
  const navigate = useNavigate();

  if (reports.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No reports found
      </p>
    );
  }

  const getPrimaryCategory = (report: Report) => {
    const primaryAssignment = report.report_category_assignments?.find(
      (assignment) => assignment.is_primary
    );
    return primaryAssignment?.main_categories?.name || "Uncategorized";
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{report.title}</h3>
              <p className="text-sm text-muted-foreground">
                Primary Category: {getPrimaryCategory(report)}
              </p>
              <p className="text-sm text-muted-foreground">
                {report.incident_date
                  ? format(new Date(report.incident_date), "PPP")
                  : "No date specified"}
              </p>
            </div>
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
        </div>
      ))}
    </div>
  );
};