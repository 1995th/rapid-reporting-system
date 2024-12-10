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
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const ReportMetrics = () => {
  const { data: reportsByCategory, isLoading: loadingCategories } = useQuery({
    queryKey: ["reportsByCategory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          category_id,
          case_categories (
            name
          ),
          count
        `)
        .select('*', { count: 'exact' })
        .groupBy('category_id, case_categories.name');

      if (error) throw error;
      return data.map(item => ({
        category: item.case_categories?.name || 'Uncategorized',
        count: parseInt(item.count)
      }));
    }
  });

  if (loadingCategories) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports by Category</CardTitle>
        <CardDescription>Distribution of reports across different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              reports: {
                theme: {
                  light: "#0ea5e9",
                  dark: "#0ea5e9",
                },
              },
            }}
          >
            <BarChart data={reportsByCategory}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">{payload[0]?.payload?.category}</div>
                      <div className="font-medium">{payload[0]?.value} reports</div>
                    </div>
                  </div>
                );
              }} />
              <Bar dataKey="count" fill="var(--color-reports)" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMetrics;