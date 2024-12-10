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

const TotalReports = () => {
  const { data: totalReports, isLoading } = useQuery({
    queryKey: ["totalReports"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact' });

      if (error) throw error;
      return count;
    }
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[150px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Reports</CardTitle>
        <CardDescription>Number of reports submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{totalReports}</div>
      </CardContent>
    </Card>
  );
};

export default TotalReports;