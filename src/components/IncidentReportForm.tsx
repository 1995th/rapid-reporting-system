import { useParams } from "react-router-dom";
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
import { useSingleReportData } from "@/hooks/useSingleReportData";
import { useReportForm } from "@/hooks/useReportForm";
import type { ReportFormSchema } from "@/lib/validations/report";

const IncidentReportForm = () => {
  const { id } = useParams();
  const { data: report } = useSingleReportData(id);
  const form = useReportForm(report);
  const { handleSubmit, isSubmitting } = useIncidentReportSubmission(id);

  const onSubmit = async (data: ReportFormSchema) => {
    console.log("Form submission started");
    console.log("Form data:", data);
    
    // Validate required fields
    if (!data.title || !data.description || !data.main_category_id) {
      console.error("Missing required fields:", {
        title: !data.title,
        description: !data.description,
        main_category_id: !data.main_category_id,
      });
      return;
    }

    try {
      console.log("Calling handleSubmit with data");
      await handleSubmit(data);
      console.log("Form submission completed successfully");
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

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
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            <CaseReferenceField form={form} />
            <TitleField form={form} />
            <DescriptionField form={form} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateField form={form} />
              <TimeField form={form} />
            </div>
            <CategoryField form={form} />
            <FileUploadField form={form} />
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : id ? "Update Report" : "Submit Report"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportForm;