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

interface ReportActionsProps {
  reportId: string;
}

export const ReportActions = ({ reportId }: ReportActionsProps) => {
  const queryClient = useQueryClient();

  const updateReportStatus = async (newStatus: string) => {
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

  return (
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
          onClick={() => updateReportStatus("approved")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              updateReportStatus("approved");
            }
          }}
          role="menuitem"
        >
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateReportStatus("rejected")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              updateReportStatus("rejected");
            }
          }}
          role="menuitem"
        >
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateReportStatus("pending")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              updateReportStatus("pending");
            }
          }}
          role="menuitem"
        >
          Mark as Pending
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};