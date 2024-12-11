import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { SearchFilters } from "@/components/analytics/types";

const ITEMS_PER_PAGE = 10;

export const useReportData = (filters: SearchFilters, currentPage: number) => {
  return useQuery({
    queryKey: ["reports", filters, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select(`
          *,
          report_category_assignments!inner (
            main_category_id,
            is_primary,
            main_categories (
              id,
              name
            )
          ),
          profiles (
            first_name,
            last_name
          )
        `, { count: 'exact' })
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.title) {
        query = query.ilike("title", `%${filters.title}%`);
      }

      if (filters.categoryId) {
        query = query.eq("report_category_assignments.main_category_id", filters.categoryId);
      }

      if (filters.dateRange?.from) {
        query = query.gte(
          "incident_date",
          format(filters.dateRange.from, "yyyy-MM-dd")
        );
      }

      if (filters.dateRange?.to) {
        query = query.lte(
          "incident_date",
          format(filters.dateRange.to, "yyyy-MM-dd")
        );
      }

      // Apply pagination
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(start, start + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return { data, count };
    },
  });
};