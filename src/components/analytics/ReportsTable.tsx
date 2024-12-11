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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ReportsTableProps {
  reports: Report[];
}

export const ReportsTable = ({ reports }: ReportsTableProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      await queryClient.invalidateQueries({ queryKey: ["reportsByStatus"] });
      
      toast.success(`Report status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    }
  };

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

  return (
    <div className="overflow-x-auto rounded-md border" role="region" aria-label="Reports table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]" scope="col">Title</TableHead>
            <TableHead className="hidden md:table-cell" scope="col">Category</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead className="hidden sm:table-cell" scope="col">Reporter</TableHead>
            <TableHead className="hidden lg:table-cell" scope="col">Date</TableHead>
            <TableHead className="text-right" scope="col">Actions</TableHead>
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
                {report.case_categories?.name}
              </TableCell>
              <TableCell>
                <Badge 
                  className={getStatusColor(report.status)}
                  role="status"
                  aria-label={`Status: ${report.status}`}
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {report.profiles?.first_name} {report.profiles?.last_name}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {report.incident_date
                  ? format(new Date(report.incident_date), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="whitespace-nowrap"
                      aria-label="Update report status"
                    >
                      Update Status <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => updateReportStatus(report.id, "approved")}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          updateReportStatus(report.id, "approved");
                        }
                      }}
                      role="menuitem"
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateReportStatus(report.id, "rejected")}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          updateReportStatus(report.id, "rejected");
                        }
                      }}
                      role="menuitem"
                    >
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateReportStatus(report.id, "pending")}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          updateReportStatus(report.id, "pending");
                        }
                      }}
                      role="menuitem"
                    >
                      Mark as Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};