import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { BasicFields } from "./incident-report/BasicFields";
import { CategoryField } from "./incident-report/CategoryField";
import { FileUploadField, fileSchema } from "./incident-report/FileUploadField";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch user profile to check role
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return profile;
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_categories")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // First, create the report
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .insert({
          title: values.title,
          description: values.description,
          category_id: values.category_id,
          incident_date: values.incident_date || null,
          incident_time: values.incident_time || null,
          location: values.location || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Then, upload files if any
      if (values.files && values.files.length > 0) {
        const files = Array.from(values.files);
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("evidence")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrl } = supabase.storage
            .from("evidence")
            .getPublicUrl(filePath);

          // Create evidence record
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert({
              report_id: report.id,
              file_url: publicUrl.publicUrl,
              file_type: file.type,
              uploaded_by: user.id,
            });

          if (evidenceError) throw evidenceError;
        });

        await Promise.all(uploadPromises);
      }

      toast({
        title: "Success",
        description: "Your report has been submitted successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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