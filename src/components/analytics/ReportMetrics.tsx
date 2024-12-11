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
import { useTheme } from "@/contexts/ThemeContext";

const ReportMetrics = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const { data: reportsByCategory, isLoading: loadingCategories } = useQuery({
    queryKey: ["reportsByCategory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_category_assignments')
        .select(`
          main_categories (
            name
          )
        `)
        .eq('is_primary', true);

      if (error) throw error;

      // Process the data to count reports per category
      const categoryCounts = data.reduce((acc: { [key: string]: number }, assignment) => {
        const categoryName = assignment.main_categories?.name || 'Uncategorized';
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
      backgroundColor: 'transparent',
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: reportsByCategory ? Object.keys(reportsByCategory) : [],
      title: {
        text: 'Categories',
        style: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      lineColor: isDarkMode ? '#374151' : '#e5e7eb',
      tickColor: isDarkMode ? '#374151' : '#e5e7eb'
    },
    yAxis: {
      title: {
        text: 'Number of Reports',
        style: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      gridLineColor: isDarkMode ? '#374151' : '#e5e7eb'
    },
    series: [{
      name: 'Reports',
      type: 'column',
      data: reportsByCategory ? Object.values(reportsByCategory) : [],
      color: isDarkMode ? '#60a5fa' : '#3b82f6'
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
      pointFormat: '{point.y} reports',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      style: {
        color: isDarkMode ? '#e5e7eb' : '#374151'
      },
      borderColor: isDarkMode ? '#374151' : '#e5e7eb'
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