import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportFormSchema } from "@/lib/validations/report";
import { uploadFileToStorage } from "@/utils/fileUpload";

export const useIncidentReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      // Handle file uploads if files are present
      let evidenceData = [];
      if (data.files?.length) {
        const files = Array.from(data.files);
        const uploadPromises = files.map(file => 
          uploadFileToStorage(file, user.id)
        );
        
        const uploadedFiles = await Promise.all(uploadPromises);
        evidenceData = uploadedFiles.map(file => ({
          file_url: file.file_url,
          file_type: file.file_type,
          description: `Uploaded file: ${file.file_name}`
        }));
      }

      const reportPayload = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString(),
        incident_time: data.incident_time || null,
        main_category_id: data.main_category_id,
        case_reference: data.case_reference,
        user_id: user.id,
      };

      let savedReport;

      if (id) {
        // Update existing report
        const { data: updatedReport, error: updateError } = await supabase
          .from("reports")
          .update(reportPayload)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        savedReport = updatedReport;

        // Update category assignments
        if (data.categories?.length) {
          // Delete existing assignments
          await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", id);

          // Insert new assignments
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map(subcategoryId => ({
                report_id: id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) throw categoryError;
        }
      } else {
        // Create new report
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportPayload)
          .select()
          .single();

        if (insertError) throw insertError;
        savedReport = newReport;

        // Insert category assignments
        if (data.categories?.length) {
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map(subcategoryId => ({
                report_id: savedReport.id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) throw categoryError;
        }
      }

      // Insert evidence if files were uploaded
      if (evidenceData.length > 0) {
        const { error: evidenceError } = await supabase
          .from("evidence")
          .insert(
            evidenceData.map(evidence => ({
              ...evidence,
              report_id: savedReport.id,
              uploaded_by: user.id,
            }))
          );

        if (evidenceError) throw evidenceError;
      }

      toast({
        title: id ? "Report updated" : "Report submitted",
        description: id 
          ? "Your report has been updated successfully."
          : "Your report has been submitted successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};