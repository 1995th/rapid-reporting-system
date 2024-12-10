import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Report } from "./types";
import { useNavigate } from "react-router-dom";

interface ReportsTableProps {
  reports: Report[];
}

export const ReportsTable = ({ reports }: ReportsTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports?.map((report) => (
            <TableRow 
              key={report.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <TableCell className="font-medium">{report.title}</TableCell>
              <TableCell>{report.case_categories?.name}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {report.profiles?.first_name} {report.profiles?.last_name}
              </TableCell>
              <TableCell>
                {report.incident_date
                  ? format(new Date(report.incident_date), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};