import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BackButton } from "@/components/layout/BackButton";
import { TitleField } from "./incident-report/TitleField";
import { DescriptionField } from "./incident-report/DescriptionField";
import { DateField } from "./incident-report/DateField";
import { TimeField } from "./incident-report/TimeField";
import { CategoryField } from "./incident-report/CategoryField";
import { FileUploadField } from "./incident-report/FileUploadField";
import { ReportFormSchema, reportFormSchema } from "@/lib/validations/report";
import { useReportData } from "@/hooks/useReportData";
import { useReportSubmission } from "@/hooks/useReportSubmission";
import { Loader2 } from "lucide-react";

const IncidentReportForm = () => {
  const { id } = useParams();
  const { submitReport, isSubmitting } = useReportSubmission(id);
  const { data: report, isLoading } = useReportData(id);

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      incident_time: "",
      main_category_id: "",
      categories: [],
      files: undefined,
    },
  });

  useEffect(() => {
    if (report) {
      console.log("Setting form values with report:", report);
      form.reset({
        title: report.title,
        description: report.description,
        incident_date: new Date(report.incident_date),
        incident_time: report.incident_time || "",
        main_category_id: report.main_category_id || "",
        categories: report.categories || [],
      });
    }
  }, [report, form]);

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
          <form onSubmit={form.handleSubmit(submitReport)} className="space-y-4">
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