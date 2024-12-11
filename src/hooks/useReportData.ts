import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReportData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Fetching report data for ID:", id);
      
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(`
          *,
          report_category_assignments(subcategory_id)
        `)
        .eq("id", id)
        .single();

      if (reportError) {
        console.error("Error fetching report:", reportError);
        throw reportError;
      }

      console.log("Fetched report data:", reportData);

      return {
        ...reportData,
        categories: reportData.report_category_assignments?.map(
          (assignment: any) => assignment.subcategory_id
        ) || [],
      };
    },
    enabled: !!id,
  });
};