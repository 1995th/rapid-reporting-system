import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSingleReportData = (id?: string) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Fetching report data for ID:", id);
      
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*, report_category_assignments(subcategory_id)")
        .eq("id", id)
        .single();

      if (reportError) {
        console.error("Error fetching report:", reportError);
        throw reportError;
      }

      console.log("Fetched report data:", reportData);
      
      // Ensure incident_date is properly parsed as a Date object
      const parsedData = {
        ...reportData,
        incident_date: reportData.incident_date ? new Date(reportData.incident_date) : new Date(),
        categories: reportData.report_category_assignments?.map(
          (assignment: any) => assignment.subcategory_id
        ) || [],
      };

      return parsedData;
    },
    enabled: !!id,
  });
};