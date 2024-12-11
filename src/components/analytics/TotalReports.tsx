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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg md:text-xl">Total Reports</CardTitle>
        <CardDescription className="text-sm md:text-base">Number of reports submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl md:text-4xl font-bold">{totalReports}</div>
      </CardContent>
    </Card>
  );
};

export default TotalReports;