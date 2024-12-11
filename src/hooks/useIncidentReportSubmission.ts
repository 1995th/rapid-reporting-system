import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportFormSchema } from "@/lib/validations/report";
import { uploadFileToStorage } from "@/utils/fileUpload";

const handleFileUploads = async (files: FileList, userId: string) => {
  console.log("Processing files:", files);
  const uploadPromises = Array.from(files).map(file => {
    console.log("Uploading file:", file.name);
    return uploadFileToStorage(file, userId);
  });
  
  const uploadedFiles = await Promise.all(uploadPromises);
  console.log("Files uploaded successfully:", uploadedFiles);
  return uploadedFiles.map(file => ({
    file_url: file.file_url,
    file_type: file.file_type,
    description: `Uploaded file: ${file.file_name}`
  }));
};

const handleCategoryAssignments = async (reportId: string, formData: ReportFormSchema) => {
  if (!formData.categories?.length) return;
  
  const categoryAssignments = formData.categories.map(subcategoryId => ({
    report_id: reportId,
    subcategory_id: subcategoryId,
    main_category_id: formData.main_category_id,
    is_primary: false,
  }));

  const { error: categoryError } = await supabase
    .from("report_category_assignments")
    .insert(categoryAssignments);

  if (categoryError) throw categoryError;
};

export const useIncidentReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (formData: ReportFormSchema) => {
    try {
      console.log("Starting form submission with data:", formData);
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Handle file uploads
      let evidenceData = [];
      if (formData.files?.length) {
        evidenceData = await handleFileUploads(formData.files, user.id);
      }

      // Prepare and submit report data
      const reportPayload = {
        title: formData.title,
        description: formData.description,
        incident_date: formData.incident_date.toISOString(),
        incident_time: formData.incident_time,
        main_category_id: formData.main_category_id,
        case_reference: formData.case_reference || null,
        user_id: user.id,
      };

      let report;
      if (id) {
        const { data: updatedReport, error: updateError } = await supabase
          .from("reports")
          .update(reportPayload)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        report = updatedReport;
      } else {
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportPayload)
          .select()
          .single();

        if (insertError) throw insertError;
        report = newReport;
      }

      // Handle category assignments
      if (report) {
        if (id) {
          const { error: deleteError } = await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", id);

          if (deleteError) throw deleteError;
        }
        await handleCategoryAssignments(report.id, formData);
      }

      // Handle evidence uploads
      if (evidenceData.length > 0 && report) {
        const evidenceRecords = evidenceData.map(evidence => ({
          ...evidence,
          report_id: report.id,
          uploaded_by: user.id,
        }));

        const { error: evidenceError } = await supabase
          .from("evidence")
          .insert(evidenceRecords);

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
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};