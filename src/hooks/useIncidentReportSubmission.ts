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
        evidenceData = await Promise.all(uploadPromises);
      }

      if (id) {
        // Update existing report
        const { error: updateError } = await supabase
          .from("reports")
          .update({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time,
            main_category_id: data.main_category_id,
          })
          .eq("id", id);

        if (updateError) throw updateError;

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

        // Insert new evidence if files were uploaded
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

          if (evidenceError) throw evidenceError;
        }

        toast({
          title: "Report updated",
          description: "Your report has been updated successfully.",
        });
      } else {
        // Create new report
        const { data: reportData, error: insertError } = await supabase
          .from("reports")
          .insert({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time,
            main_category_id: data.main_category_id,
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Insert category assignments
        if (data.categories?.length) {
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map(subcategoryId => ({
                report_id: reportData.id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) throw categoryError;
        }

        // Insert evidence if files were uploaded
        if (evidenceData.length > 0) {
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: reportData.id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) throw evidenceError;
        }

        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully.",
        });
      }

      navigate("/");
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