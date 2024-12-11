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
      console.log("Starting form submission with data:", formData);
      console.log("Report ID (if editing):", id);
      
      setIsSubmitting(true);

      const user = (await supabase.auth.getUser()).data.user;
      console.log("Current user:", user);
      
      if (!user) {
        console.error("No user found");
        throw new Error("No user found");
      }

      // Handle file uploads if files are present
      let evidenceData = [];
      if (formData.files?.length) {
        console.log("Processing files:", formData.files);
        const files = Array.from(formData.files);
        const uploadPromises = files.map(file => {
          console.log("Uploading file:", file.name);
          return uploadFileToStorage(file, user.id);
        });
        
        try {
          const uploadedFiles = await Promise.all(uploadPromises);
          console.log("Files uploaded successfully:", uploadedFiles);
          evidenceData = uploadedFiles.map(file => ({
            file_url: file.file_url,
            file_type: file.file_type,
            description: `Uploaded file: ${file.file_name}`
          }));
        } catch (uploadError) {
          console.error("Error uploading files:", uploadError);
          throw uploadError;
        }
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

      console.log("Prepared report payload:", reportPayload);

      let report;
      if (id) {
        console.log("Updating existing report with ID:", id);
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
        console.log("Report updated successfully:", updatedReport);
        report = updatedReport;
      } else {
        console.log("Creating new report");
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportPayload)
          .select()
          .single();

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }
        console.log("New report created successfully:", newReport);
        report = newReport;
      }

      // Handle category assignments
      if (formData.categories?.length && report) {
        console.log("Processing category assignments:", formData.categories);
        
        if (id) {
          console.log("Deleting existing category assignments for report:", id);
          const { error: deleteError } = await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", id);

          if (deleteError) {
            console.error("Error deleting existing categories:", deleteError);
            throw deleteError;
          }
        }

        const categoryAssignments = formData.categories.map(subcategoryId => ({
          report_id: report.id,
          subcategory_id: subcategoryId,
          main_category_id: formData.main_category_id,
          is_primary: false,
        }));

        console.log("Inserting new category assignments:", categoryAssignments);
        const { error: categoryError } = await supabase
          .from("report_category_assignments")
          .insert(categoryAssignments);

        if (categoryError) {
          console.error("Error assigning categories:", categoryError);
          throw categoryError;
        }
      }

      // Handle evidence uploads
      if (evidenceData.length > 0 && report) {
        console.log("Saving evidence data:", evidenceData);
        const evidenceRecords = evidenceData.map(evidence => ({
          ...evidence,
          report_id: report.id,
          uploaded_by: user.id,
        }));

        const { error: evidenceError } = await supabase
          .from("evidence")
          .insert(evidenceRecords);

        if (evidenceError) {
          console.error("Error uploading evidence:", evidenceError);
          throw evidenceError;
        }
      }

      console.log("Report submission completed successfully");
      toast({
        title: id ? "Report updated" : "Report submitted",
        description: id 
          ? "Your report has been updated successfully."
          : "Your report has been submitted successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Final error in form submission:", error);
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