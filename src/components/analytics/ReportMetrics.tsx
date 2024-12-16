import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { format } from "date-fns";
import { useOrganization } from "@/contexts/OrganizationContext";
import { DateRangeFilter } from "./metrics/DateRangeFilter";
import { CategoryChart } from "./metrics/CategoryChart";

const ReportMetrics = () => {
  const { theme } = useTheme();
  const { organization } = useOrganization();
  const isDarkMode = theme === 'dark';
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: reportsByCategory, isLoading: loadingCategories } = useQuery({
    queryKey: ["reportsByCategory", dateRange, organization?.id],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select(`
          id,
          report_category_assignments (
            main_category_id,
            main_categories (
              name
            )
          )
        `)
        .eq('organization_id', organization?.id);

      if (dateRange?.from) {
        query = query.gte('created_at', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        query = query.lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;

      const categoryCounts = data.reduce((acc: { [key: string]: number }, report) => {
        const primaryAssignment = report.report_category_assignments?.[0];
        const categoryName = primaryAssignment?.main_categories?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      return categoryCounts;
    },
    enabled: !!organization?.id
  });

  if (loadingCategories) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Reports by Category</CardTitle>
            <CardDescription>Distribution of reports across different categories</CardDescription>
          </div>
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {reportsByCategory && (
          <CategoryChart
            data={reportsByCategory}
            isDarkMode={isDarkMode}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ReportMetrics;