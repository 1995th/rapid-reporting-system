import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryDisplay } from "./CategoryDisplay";
import { ReportMetadata } from "./ReportMetadata";
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react";

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

  const { data: evidence, isLoading: isEvidenceLoading } = useQuery({
    queryKey: ["report-evidence", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("report_id", report.id);

      if (error) throw error;
      return data;
    },
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <VideoIcon className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

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
        {evidence && evidence.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Evidence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {evidence.map((item) => (
                <a
                  key={item.id}
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {getFileIcon(item.file_type)}
                  <span className="ml-2 text-sm truncate">{item.description}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
