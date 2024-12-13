import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryDisplay } from "./CategoryDisplay";
import { ReportMetadata } from "./ReportMetadata";

interface ReportContentProps {
  report: {
    id: string;
    title: string;
    status: string;
    profiles: {
      first_name: string;
      last_name: string;
    };
    incident_date: string;
    incident_time: string | null;
    description: string;
    location: string | null;
  };
}

export const ReportContent = ({ report }: ReportContentProps) => {
  const { data: categoryAssignments, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["report-categories", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_category_assignments")
        .select(`
          main_categories (
            id,
            name
          ),
          subcategories (
            id,
            name
          ),
          is_primary
        `)
        .eq("report_id", report.id);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CategoryDisplay 
              categoryAssignments={categoryAssignments} 
              isLoading={isCategoryLoading} 
            />
          </div>
          <ReportMetadata
            status={report.status}
            reporter={report.profiles}
            location={report.location}
            incidentDate={report.incident_date}
            incidentTime={report.incident_time}
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{report.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};