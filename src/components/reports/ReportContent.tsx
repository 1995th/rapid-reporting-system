import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportContentProps {
  report: {
    title: string;
    status: string;
    case_categories: {
      name: string;
    };
    profiles: {
      first_name: string;
      last_name: string;
    };
    incident_date: string;
    description: string;
  };
}

export const ReportContent = ({ report }: ReportContentProps) => {
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