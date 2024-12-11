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
import { useCategories } from "@/hooks/useCategories";
import { useIncidentReportSubmission } from "@/hooks/useIncidentReportSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { useEffect } from "react";

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
  const { id } = useParams();
  const { data: userProfile } = useRoleAuthorization();
  const { data: categories } = useCategories();
  const { handleSubmit: submitReport, isSubmitting } = useIncidentReportSubmission();

  // Fetch existing report data if editing
  const { data: existingReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id, // Only run query if we have an ID
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingReport?.title || "",
      description: existingReport?.description || "",
      category_id: existingReport?.category_id || "",
      incident_date: existingReport?.incident_date || "",
      incident_time: existingReport?.incident_time || "",
      location: existingReport?.location || "",
    },
  });

  // Update form values when existing report data is loaded
  useEffect(() => {
    if (existingReport) {
      form.reset({
        title: existingReport.title,
        description: existingReport.description,
        category_id: existingReport.category_id,
        incident_date: existingReport.incident_date || "",
        incident_time: existingReport.incident_time || "",
        location: existingReport.location || "",
        files: undefined, // Set to undefined instead of empty array for FileList type
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
          {categories && <CategoryField form={form} categories={categories} />}
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