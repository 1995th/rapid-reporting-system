import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/components/analytics/types";

interface ReportFilters {
  title?: string;
  categoryId?: string | null;
  dateRange?: { from: Date; to: Date };
}

export const useReportData = (filters: ReportFilters, page: number) => {
  const ITEMS_PER_PAGE = 10;
  
  return useQuery({
    queryKey: ["reports", filters, page],
    queryFn: async () => {
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
            main_category_id,
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
          .gte('incident_date', filters.dateRange.from.toISOString().split('T')[0])
          .lte('incident_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      // Add pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }

      return {
        data: (data as Report[]) || [],
        count: count || 0
      };
    },
  });
};