import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportFormSchema } from "@/lib/validations/report";
import { useFileUpload } from "./useFileUpload";

export const useReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleFileUpload } = useFileUpload();

  const submitReport = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting form data:", data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Handle file uploads if files are present
      const evidenceData = await handleFileUpload(data.files, user.id);

      const reportData = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString(),
        incident_time: data.incident_time,
        main_category_id: data.main_category_id,
        user_id: user.id,
      };

      if (id) {
        await updateExistingReport(id, reportData, data.categories, evidenceData, user.id);
        toast({
          title: "Report updated",
          description: "Your report has been updated successfully.",
        });
      } else {
        await createNewReport(reportData, data.categories, evidenceData, user.id);
        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully.",
        });
      }

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

  return { submitReport, isSubmitting };
};

async function updateExistingReport(
  id: string,
  reportData: any,
  categories: string[],
  evidenceData: any[],
  userId: string
) {
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      ...reportData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) throw updateError;

  if (categories?.length) {
    await supabase
      .from("report_category_assignments")
      .delete()
      .eq("report_id", id);

    const { error: categoryError } = await supabase
      .from("report_category_assignments")
      .insert(
        categories.map(subcategoryId => ({
          report_id: id,
          subcategory_id: subcategoryId,
          main_category_id: reportData.main_category_id,
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
          report_id: id,
          uploaded_by: userId,
        }))
      );

    if (evidenceError) throw evidenceError;
  }
}

async function createNewReport(
  reportData: any,
  categories: string[],
  evidenceData: any[],
  userId: string
) {
  const { data: newReport, error: insertError } = await supabase
    .from("reports")
    .insert(reportData)
    .select()
    .single();

  if (insertError) throw insertError;

  if (categories?.length) {
    const { error: categoryError } = await supabase
      .from("report_category_assignments")
      .insert(
        categories.map(subcategoryId => ({
          report_id: newReport.id,
          subcategory_id: subcategoryId,
          main_category_id: reportData.main_category_id,
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
          report_id: newReport.id,
          uploaded_by: userId,
        }))
      );

    if (evidenceError) throw evidenceError;
  }
}