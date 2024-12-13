import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BackButton } from "@/components/layout/BackButton";
import { TitleField } from "./incident-report/TitleField";
import { DescriptionField } from "./incident-report/DescriptionField";
import { DateField } from "./incident-report/DateField";
import { TimeField } from "./incident-report/TimeField";
import { CategoryField } from "./incident-report/CategoryField";
import { LocationField } from "./incident-report/LocationField";
import { FileUploadField } from "./incident-report/FileUploadField";
import { ReportFormSchema, reportFormSchema } from "@/lib/validations/report";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReportSubmission } from "@/hooks/useReportSubmission";

const IncidentReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSubmit: submitReport, isSubmitting } = useReportSubmission(id);

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      incident_time: "",
      location: "",
      main_category_id: "",
      categories: [],
      files: undefined,
    },
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Fetching report data for ID:", id);
      
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(`
          *,
          report_category_assignments(subcategory_id)
        `)
        .eq("id", id)
        .single();

      if (reportError) {
        console.error("Error fetching report:", reportError);
        toast({
          title: "Error",
          description: "Failed to fetch report data",
          variant: "destructive",
        });
        throw reportError;
      }

      console.log("Fetched report data:", reportData);

      return {
        ...reportData,
        categories: reportData.report_category_assignments?.map(
          (assignment: any) => assignment.subcategory_id
        ) || [],
      };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (report) {
      console.log("Setting form values with report:", report);
      form.reset({
        title: report.title,
        description: report.description,
        incident_date: new Date(report.incident_date),
        incident_time: report.incident_time || "",
        location: report.location || "",
        main_category_id: report.main_category_id || "",
        categories: report.categories || [],
      });
    }
  }, [report, form]);

  const onSubmit = async (data: ReportFormSchema) => {
    console.log("Form submitted with data:", data);
    const success = await submitReport(data);
    if (success) {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? "Edit Report" : "Submit New Report"}
          </h1>
          <p className="text-muted-foreground">
            {id
              ? "Update the details of your incident report"
              : "Fill out the details of your incident report"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TitleField form={form} />
            <DescriptionField form={form} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LocationField form={form} />
              <DateField form={form} />
              <TimeField form={form} />
            </div>
            <CategoryField form={form} />
            <FileUploadField form={form} />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {id ? "Updating..." : "Submitting..."}
                </>
              ) : (
                id ? "Update Report" : "Submit Report"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportForm;