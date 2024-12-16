import { useTheme } from "@/contexts/ThemeContext";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface CategoryChartProps {
  data: Record<string, number>;
  isDarkMode: boolean;
}

export const CategoryChart = ({ data, isDarkMode }: CategoryChartProps) => {
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
      categories: Object.keys(data),
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
      allowDecimals: false,
      min: 0,
      gridLineColor: isDarkMode ? '#374151' : '#e5e7eb'
    },
    series: [{
      name: 'Reports',
      type: 'column',
      data: Object.values(data),
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
      pointFormatter: function(this: Highcharts.Point) {
        return `${this.y} report${this.y === 1 ? '' : 's'}`;
      },
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      style: {
        color: isDarkMode ? '#e5e7eb' : '#374151'
      },
      borderColor: isDarkMode ? '#374151' : '#e5e7eb'
    }
  };

  return (
    <div className="w-full">
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
};