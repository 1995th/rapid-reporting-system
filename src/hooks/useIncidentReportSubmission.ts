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
      console.log("Starting form submission with data:", data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return;
      }

      let evidenceData = [];
      if (data.files?.length) {
        const files = Array.from(data.files);
        const uploadPromises = files.map(file => 
          uploadFileToStorage(file, user.id)
        );
        
        evidenceData = await Promise.all(uploadPromises);
      }

      const reportData = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString().split('T')[0],
        incident_time: data.incident_time,
        main_category_id: data.main_category_id,
        user_id: user.id,
      };

      let reportId = id;

      if (id) {
        const { error: updateError } = await supabase
          .from("reports")
          .update(reportData)
          .eq("id", id);

        if (updateError) throw updateError;
      } else {
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportData)
          .select()
          .single();

        if (insertError) throw insertError;
        reportId = newReport.id;
      }

      if (data.categories?.length) {
        if (id) {
          await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", id);
        }

        const { error: categoryError } = await supabase
          .from("report_category_assignments")
          .insert(
            data.categories.map(subcategoryId => ({
              report_id: reportId,
              subcategory_id: subcategoryId,
              main_category_id: data.main_category_id,
              is_primary: false,
            }))
          );

        if (categoryError) throw categoryError;
      }

      if (evidenceData.length > 0) {
        const { error: evidenceError } = await supabase
          .from("evidence")
          .insert(
            evidenceData.map(evidence => ({
              ...evidence,
              report_id: reportId,
              uploaded_by: user.id,
            }))
          );

        if (evidenceError) throw evidenceError;
      }

      toast({
        title: "Success",
        description: id ? "Report updated successfully" : "Report submitted successfully",
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