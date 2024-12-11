import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ReportFilters } from "./reports/ReportFilters";
import { ReportsList } from "./reports/ReportsList";

export const UserReportsSection = ({ userId }: { userId: string }) => {
  const [filters, setFilters] = useState({
    title: "",
    status: "all",
    dateRange: undefined as DateRange | undefined,
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ["user-reports", userId, filters],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select(`
          id,
          title,
          status,
          incident_date,
          report_category_assignments!report_category_assignments_report_id_fkey (
            main_categories (
              id,
              name
            ),
            main_category_id,
            is_primary
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (filters.title) {
        query = query.ilike("title", `%${filters.title}%`);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
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

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ReportFilters filters={filters} onFiltersChange={setFilters} />
          <ReportsList reports={reports || []} />
        </div>
      </CardContent>
    </Card>
  );
};