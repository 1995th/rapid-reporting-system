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

type StatusCount = {
  status: string;
  count: number;
};

const ReportStatusMetrics = () => {
  const { data: statusCounts, isLoading } = useQuery({
    queryKey: ["reportsByStatus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('status');

      if (error) throw error;
      
      const counts = data.reduce((acc: { [key: string]: number }, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {});
      
      return {
        approved: counts['approved'] || 0,
        pending: counts['pending'] || 0,
        rejected: counts['rejected'] || 0
      };
    }
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[150px]" />;
  }

  const statuses = [
    { label: "Approved", value: statusCounts?.approved || 0, color: "text-green-600" },
    { label: "Pending", value: statusCounts?.pending || 0, color: "text-yellow-600" },
    { label: "Rejected", value: statusCounts?.rejected || 0, color: "text-red-600" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statuses.map((status) => (
        <Card key={status.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {status.label} Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${status.color}`}>
              {status.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportStatusMetrics;