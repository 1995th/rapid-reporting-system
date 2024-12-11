import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BasicFields } from "./incident-report/BasicFields";
import { CategoryField } from "./incident-report/CategoryField";
import { FileUploadField, fileSchema } from "./incident-report/FileUploadField";
import { useRoleAuthorization } from "@/hooks/useRoleAuthorization";
import { useIncidentReportSubmission } from "@/hooks/useIncidentReportSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  primary_category_id: z.string().uuid("Please select a primary category"),
  secondary_categories: z.array(z.string().uuid()).optional().default([]),
  incident_date: z.string().optional(),
  incident_time: z.string().optional(),
  location: z.string().optional(),
  files: fileSchema,
});

const IncidentReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: userProfile } = useRoleAuthorization();
  const { handleSubmit: submitReport, isSubmitting } = useIncidentReportSubmission();

  // Fetch existing report data if editing
  const { data: existingReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .select(`
          *,
          report_category_assignments (
            main_category_id,
            subcategory_id,
            is_primary
          )
        `)
        .eq("id", id)
        .single();
      
      if (reportError) throw reportError;
      
      const primaryCategory = report.report_category_assignments.find(
        (assignment: any) => assignment.is_primary
      );
      
      const secondaryCategories = report.report_category_assignments
        .filter((assignment: any) => !assignment.is_primary)
        .map((assignment: any) => assignment.subcategory_id);

      return {
        ...report,
        primary_category_id: primaryCategory?.main_category_id,
        secondary_categories: secondaryCategories,
      };
    },
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      primary_category_id: "",
      secondary_categories: [],
      incident_date: "",
      incident_time: "",
      location: "",
      files: undefined,
    },
  });

  // Update form values when existing report data is loaded
  useEffect(() => {
    if (existingReport) {
      form.reset({
        title: existingReport.title,
        description: existingReport.description,
        primary_category_id: existingReport.primary_category_id || "",
        secondary_categories: existingReport.secondary_categories || [],
        incident_date: existingReport.incident_date || "",
        incident_time: existingReport.incident_time || "",
        location: existingReport.location || "",
        files: undefined,
      });
    }
  }, [existingReport, form]);

  // If user is not an officer or admin, redirect them
  if (userProfile && userProfile.role !== 'officer' && userProfile.role !== 'admin') {
    navigate('/');
    return null;
  }

  if (id && isLoadingReport) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? "Edit Incident Report" : "Submit Incident Report"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Please provide details about the incident you'd like to report.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitReport)} className="space-y-6">
          <BasicFields form={form} />
          <CategoryField form={form} />
          <FileUploadField form={form} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : (id ? "Update Report" : "Submit Report")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default IncidentReportForm;