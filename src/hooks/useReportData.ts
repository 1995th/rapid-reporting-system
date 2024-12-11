import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "@/components/analytics/types";

interface ReportDataResponse {
  data: any[];
  count: number;
}

export const useReportData = (filters: SearchFilters, page: number) => {
  const ITEMS_PER_PAGE = 10;
  
  return useQuery({
    queryKey: ["reports", filters, page],
    queryFn: async (): Promise<ReportDataResponse> => {
      console.log("Fetching reports with filters:", filters);
      
      let query = supabase
        .from("reports")
        .select(`
          *,
          profiles (
            first_name,
            last_name
          ),
          report_category_assignments (
            main_categories (
              id,
              name
            ),
            is_primary
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }

      if (filters.categoryId) {
        query = query.eq('main_category_id', filters.categoryId);
      }

      if (filters.dateRange?.from && filters.dateRange?.to) {
        query = query
          .gte('incident_date', filters.dateRange.from.toISOString())
          .lte('incident_date', filters.dateRange.to.toISOString());
      }

      // Add pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }

      return {
        data: data || [],
        count: count || 0
      };
    },
  });
};