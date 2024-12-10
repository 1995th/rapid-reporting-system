import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BasicFields } from "./incident-report/BasicFields";
import { CategoryField } from "./incident-report/CategoryField";
import { FileUploadField, fileSchema } from "./incident-report/FileUploadField";
import { useRoleAuthorization } from "@/hooks/useRoleAuthorization";
import { useCategories } from "@/hooks/useCategories";
import { useIncidentReportSubmission } from "@/hooks/useIncidentReportSubmission";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().uuid("Please select a category"),
  incident_date: z.string().optional(),
  incident_time: z.string().optional(),
  location: z.string().optional(),
  files: fileSchema,
});

const IncidentReportForm = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useRoleAuthorization();
  const { data: categories } = useCategories();
  const { handleSubmit: submitReport, isSubmitting } = useIncidentReportSubmission();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: "",
      incident_time: "",
      location: "",
    },
  });

  // If user is not an officer or admin, redirect them
  if (userProfile && userProfile.role !== 'officer' && userProfile.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Submit Incident Report
        </h1>
        <p className="text-muted-foreground mt-2">
          Please provide details about the incident you'd like to report.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitReport)} className="space-y-6">
          <BasicFields form={form} />
          {categories && <CategoryField form={form} categories={categories} />}
          <FileUploadField form={form} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default IncidentReportForm;