import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportFormSchema } from "@/lib/validations/report";

export const useReportSubmission = (reportId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return;
      }

      // Handle file uploads first if there are any
      let evidenceData = [];
      if (data.files?.length) {
        const files = Array.from(data.files);
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);

          evidenceData.push({
            file_url: publicUrl,
            file_type: file.type,
            file_name: file.name,
            description: `Uploaded file: ${file.name}`
          });
        }
      }

      // Prepare report data
      const reportData = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString().split('T')[0],
        incident_time: data.incident_time,
        main_category_id: data.main_category_id,
        user_id: user.id,
      };

      // Handle report creation/update
      let finalReportId = reportId;
      if (reportId) {
        const { error: updateError } = await supabase
          .from("reports")
          .update(reportData)
          .eq("id", reportId);

        if (updateError) throw updateError;
      } else {
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportData)
          .select()
          .single();

        if (insertError) throw insertError;
        finalReportId = newReport.id;
      }

      // Handle category assignments
      if (data.categories?.length && finalReportId) {
        await supabase
          .from("report_category_assignments")
          .delete()
          .eq("report_id", finalReportId);

        const categoryAssignments = data.categories.map(subcategoryId => ({
          report_id: finalReportId,
          subcategory_id: subcategoryId,
          main_category_id: data.main_category_id,
          is_primary: false,
        }));

        const { error: categoryError } = await supabase
          .from("report_category_assignments")
          .insert(categoryAssignments);

        if (categoryError) throw categoryError;
      }

      // Handle evidence uploads
      if (evidenceData.length > 0 && finalReportId) {
        const { error: evidenceError } = await supabase
          .from("evidence")
          .insert(
            evidenceData.map(evidence => ({
              ...evidence,
              report_id: finalReportId,
              uploaded_by: user.id,
            }))
          );

        if (evidenceError) throw evidenceError;
      }

      toast({
        title: "Success",
        description: reportId ? "Report updated successfully" : "Report submitted successfully",
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