import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ReportMetadataProps {
  status: string;
  reporter: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  incidentDate: string;
}

export const ReportMetadata = ({ status, reporter, incidentDate }: ReportMetadataProps) => {
  const officerName = reporter 
    ? `${reporter.first_name || ''} ${reporter.last_name || ''}`.trim() 
    : 'Not assigned';

  return (
    <>
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
        <Badge
          variant={
            status === "resolved"
              ? "success"
              : status === "in_progress"
              ? "warning"
              : "default"
          }
        >
          {status}
        </Badge>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground">Officer</h3>
        <p>{officerName}</p>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground">Date</h3>
        <p>
          {incidentDate ? format(new Date(incidentDate), "MMM d, yyyy") : "N/A"}
        </p>
      </div>
    </>
  );
};