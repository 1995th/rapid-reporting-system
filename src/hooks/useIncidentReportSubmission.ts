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

  const handleSubmit = async (formData: ReportFormSchema) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting form data:", formData); // Debug log

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      // Handle file uploads if files are present
      let evidenceData = [];
      if (formData.files?.length) {
        const files = Array.from(formData.files);
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

      // Prepare report data
      const reportPayload = {
        title: formData.title,
        description: formData.description,
        incident_date: formData.incident_date.toISOString(),
        incident_time: formData.incident_time,
        main_category_id: formData.main_category_id,
        case_reference: formData.case_reference || null,
        user_id: user.id,
      };

      console.log("Report payload:", reportPayload); // Debug log

      let report;
      if (id) {
        // Update existing report
        const { data: updatedReport, error: updateError } = await supabase
          .from("reports")
          .update(reportPayload)
          .eq("id", id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating report:", updateError);
          throw updateError;
        }
        report = updatedReport;
      } else {
        // Create new report
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportPayload)
          .select()
          .single();

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }
        report = newReport;
      }

      // Handle category assignments
      if (formData.categories?.length && report) {
        // Delete existing assignments if updating
        if (id) {
          const { error: deleteError } = await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", id);

          if (deleteError) {
            console.error("Error deleting existing categories:", deleteError);
            throw deleteError;
          }
        }

        // Insert new category assignments
        const { error: categoryError } = await supabase
          .from("report_category_assignments")
          .insert(
            formData.categories.map(subcategoryId => ({
              report_id: report.id,
              subcategory_id: subcategoryId,
              main_category_id: formData.main_category_id,
              is_primary: false,
            }))
          );

        if (categoryError) {
          console.error("Error assigning categories:", categoryError);
          throw categoryError;
        }
      }

      // Handle evidence uploads
      if (evidenceData.length > 0 && report) {
        const { error: evidenceError } = await supabase
          .from("evidence")
          .insert(
            evidenceData.map(evidence => ({
              ...evidence,
              report_id: report.id,
              uploaded_by: user.id,
            }))
          );

        if (evidenceError) {
          console.error("Error uploading evidence:", evidenceError);
          throw evidenceError;
        }
      }

      toast({
        title: id ? "Report updated" : "Report submitted",
        description: id 
          ? "Your report has been updated successfully."
          : "Your report has been submitted successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error in form submission:", error);
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