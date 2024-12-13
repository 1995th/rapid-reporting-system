import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReportFormSchema } from "@/lib/validations/report";
import { useToast } from "@/hooks/use-toast";
import { updateCategoryAssignments } from "@/utils/categoryUtils";

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

      // If updating an existing report, check its current status
      let shouldResetStatus = false;
      if (id) {
        const { data: existingReport } = await supabase
          .from("reports")
          .select("status")
          .eq("id", id)
          .single();
        
        shouldResetStatus = existingReport?.status === 'approved' || existingReport?.status === 'rejected';
      }

      // Handle file uploads if present
      let evidenceData = [];
      if (data.files?.length) {
        console.log("Processing file uploads...");
        const files = Array.from(data.files);
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('evidence')
            .upload(fileName, file);

          if (uploadError) {
            console.error("File upload error:", uploadError);
            throw new Error("Failed to upload file");
          }

          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('evidence')
              .getPublicUrl(fileName);

            evidenceData.push({
              file_url: publicUrl,
              file_type: file.type,
              description: file.name,
            });
          }
        }
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
            updated_at: new Date().toISOString(),
            // Reset status to pending if the report was approved/rejected
            ...(shouldResetStatus && { status: 'pending' })
          })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating report:", updateError);
          throw updateError;
        }

        // Update category assignments
        if (data.categories?.length) {
          console.log("Updating category assignments...");
          await updateCategoryAssignments(id, data.categories);
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
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }

        // Insert category assignments
        if (data.categories?.length && reportData) {
          console.log("Adding category assignments...");
          await updateCategoryAssignments(reportData.id, data.categories);
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