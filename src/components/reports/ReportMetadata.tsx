import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ReportMetadataProps {
  status: string;
  reporter: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  incidentDate: string;
  incidentTime?: string | null;
}

export const ReportMetadata = ({ status, reporter, incidentDate, incidentTime }: ReportMetadataProps) => {
  const officerName = reporter 
    ? `${reporter.first_name || ''} ${reporter.last_name || ''}`.trim() 
    : 'Not assigned';

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '';
    // Convert 24h time to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return ` at ${hour12}:${minutes} ${ampm}`;
  };

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
        <h3 className="font-semibold text-sm text-muted-foreground">Date & Time</h3>
        <p>
          {incidentDate ? format(new Date(incidentDate), "MMM d, yyyy") : "N/A"}
          {incidentTime ? formatTime(incidentTime) : ''
        </p>
      </div>
    </>
  );
};
