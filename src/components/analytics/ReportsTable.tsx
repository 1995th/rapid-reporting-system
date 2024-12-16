import { format } from "date-fns";
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
import { StatusBadge } from "./StatusBadge";
import { ReportActions } from "./ReportActions";

interface ReportsTableProps {
  reports: Report[];
  showActions?: boolean;
}

export const ReportsTable = ({ reports, showActions = false }: ReportsTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-md border" role="region" aria-label="Reports table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]" scope="col">Title</TableHead>
            <TableHead className="hidden md:table-cell" scope="col">Category</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead className="hidden sm:table-cell" scope="col">Officer</TableHead>
            <TableHead className="hidden lg:table-cell" scope="col">Date</TableHead>
            {showActions && <TableHead className="text-right" scope="col">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports?.map((report) => (
            <TableRow key={report.id}>
              <TableCell 
                className="font-medium cursor-pointer hover:underline min-w-[150px]"
                onClick={() => navigate(`/reports/${report.id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/reports/${report.id}`);
                  }
                }}
                aria-label={`View report: ${report.title}`}
              >
                {report.title}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {report.report_category_assignments?.[0]?.main_categories?.name || "Uncategorized"}
              </TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {report.profiles?.first_name} {report.profiles?.last_name}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {report.incident_date
                  ? format(new Date(report.incident_date), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <ReportActions reportId={report.id} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};