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
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
          )
        `);

      if (error) throw error;

      // Process the data to count reports per category
      const categoryCounts = data.reduce((acc: { [key: string]: number }, report) => {
        const categoryName = report.case_categories?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      return categoryCounts;
    }
  });

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: reportsByCategory ? Object.keys(reportsByCategory) : [],
      title: {
        text: 'Categories'
      }
    },
    yAxis: {
      title: {
        text: 'Number of Reports'
      }
    },
    series: [{
      name: 'Reports',
      type: 'column',
      data: reportsByCategory ? Object.values(reportsByCategory) : [],
      color: '#0ea5e9'
    }],
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    }
  };

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
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMetrics;