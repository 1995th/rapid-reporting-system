import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
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
import { FileUploadField } from "./incident-report/FileUploadField";
import { CaseReferenceField } from "./incident-report/CaseReferenceField";
import { useIncidentReportSubmission } from "@/hooks/useIncidentReportSubmission";
import { ReportFormSchema, reportFormSchema } from "@/lib/validations/report";

const IncidentReportForm = () => {
  const { id } = useParams();
  const { handleSubmit, isSubmitting } = useIncidentReportSubmission(id);

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      incident_time: "",
      main_category_id: "",
      categories: [],
      case_reference: "",
      files: undefined,
    },
  });

  const { data: report } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      
      // Fetch report data
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*, report_category_assignments(subcategory_id)")
        .eq("id", id)
        .single();

      if (reportError) throw reportError;

      return {
        ...reportData,
        categories: reportData.report_category_assignments.map(
          (assignment: any) => assignment.subcategory_id
        ),
      };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (report) {
      form.reset({
        title: report.title,
        description: report.description,
        incident_date: new Date(report.incident_date),
        incident_time: report.incident_time,
        main_category_id: report.main_category_id,
        categories: report.categories,
        case_reference: report.case_reference,
      });
    }
  }, [report, form]);

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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <CaseReferenceField form={form} />
            <TitleField form={form} />
            <DescriptionField form={form} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateField form={form} />
              <TimeField form={form} />
            </div>
            <CategoryField form={form} />
            <FileUploadField form={form} />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : id ? "Update Report" : "Submit Report"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportForm;