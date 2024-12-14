import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReportFormSchema } from "@/lib/validations/report";
import { useToast } from "@/hooks/use-toast";
import { uploadFileToStorage } from "@/utils/fileUpload";

export const useReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);
      console.log("Starting form submission with data:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return false;
      }

      // Handle file uploads if present
      let evidenceData = [];
      if (data.files?.length) {
        console.log("Processing file uploads...");
        const files = Array.from(data.files);
        for (const file of files) {
          try {
            const uploadedFile = await uploadFileToStorage(file, user.id);
            evidenceData.push(uploadedFile);
          } catch (error) {
            console.error("File upload error:", error);
            toast({
              title: "Error",
              description: `Failed to upload file: ${file.name}`,
              variant: "destructive",
            });
            return false;
          }
        }
        console.log("Files uploaded successfully:", evidenceData);
      }

      if (id) {
        // Update existing report
        console.log("Updating existing report:", id);
        const { error: updateError } = await supabase
          .from("reports")
          .update({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time || null,
            location: data.location || null,
            main_category_id: data.main_category_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating report:", updateError);
          throw updateError;
        }

        // Add new evidence if files were uploaded
        if (evidenceData.length > 0) {
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) {
            console.error("Error adding evidence:", evidenceError);
            throw evidenceError;
          }
        }

        toast({
          title: "Success",
          description: "Report updated successfully",
        });
      } else {
        // Create new report
        console.log("Creating new report");
        const { data: reportData, error: insertError } = await supabase
          .from("reports")
          .insert({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time || null,
            location: data.location || null,
            main_category_id: data.main_category_id || null,
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }

        // Insert evidence if files were uploaded
        if (evidenceData.length > 0 && reportData) {
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: reportData.id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) {
            console.error("Error adding evidence:", evidenceError);
            throw evidenceError;
          }
        }

        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
      }

      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};