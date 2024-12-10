import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

interface FormValues {
  title: string;
  description: string;
  category_id: string;
  incident_date?: string;
  incident_time?: string;
  location?: string;
  files?: FileList;
}

export const useIncidentReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues) => {
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
        const uploadPromises = files.map(async (file: File) => {
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

  return { handleSubmit, isSubmitting };
};