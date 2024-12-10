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
      },
      height: 250,
      spacingTop: 10,
      spacingBottom: 10,
      spacingLeft: 10,
      spacingRight: 10,
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: reportsByCategory ? Object.keys(reportsByCategory) : [],
      title: {
        text: 'Categories'
      },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Number of Reports'
      },
      labels: {
        style: {
          fontSize: '12px'
        }
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
    },
    plotOptions: {
      column: {
        borderRadius: 4
      }
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{point.y} reports'
    }
  };

  if (loadingCategories) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Reports by Category</CardTitle>
        <CardDescription>Distribution of reports across different categories</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full">
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