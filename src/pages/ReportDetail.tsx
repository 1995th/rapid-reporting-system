import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteReportButton } from "@/components/reports/DeleteReportButton";
import { ReportContent } from "@/components/reports/ReportContent";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          main_categories (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Transform the data to match the expected format
      return {
        ...data,
        case_categories: data.main_categories
      };
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Report Details</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/edit-report/${id}`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Report
          </Button>
          <DeleteReportButton reportId={id} />
        </div>
      </div>
      <ReportContent report={report} />
    </div>
  );
};

export default ReportDetail;