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
    console.log("Starting report submission with data:", data);
    console.log("Report ID:", reportId);
    
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return;
      }

      let finalReportId = reportId;
      const reportData = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString().split('T')[0],
        incident_time: data.incident_time,
        main_category_id: data.main_category_id,
        user_id: user.id,
      };

      if (reportId) {
        console.log("Updating existing report:", reportId);
        const { error: updateError } = await supabase
          .from("reports")
          .update(reportData)
          .eq("id", reportId);

        if (updateError) {
          console.error("Error updating report:", updateError);
          throw updateError;
        }
      } else {
        console.log("Creating new report");
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportData)
          .select()
          .single();

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }
        
        finalReportId = newReport.id;
        console.log("New report created with ID:", finalReportId);
      }

      // Handle category assignments
      if (data.categories?.length && finalReportId) {
        console.log("Processing category assignments");
        if (reportId) {
          console.log("Deleting existing category assignments");
          await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", reportId);
        }

        const categoryAssignments = data.categories.map(subcategoryId => ({
          report_id: finalReportId,
          subcategory_id: subcategoryId,
          main_category_id: data.main_category_id,
          is_primary: false,
        }));

        console.log("Inserting new category assignments:", categoryAssignments);
        const { error: categoryError } = await supabase
          .from("report_category_assignments")
          .insert(categoryAssignments);

        if (categoryError) {
          console.error("Error with category assignments:", categoryError);
          throw categoryError;
        }
      }

      // Handle file uploads
      if (data.files?.length) {
        console.log("Processing file uploads");
        const files = Array.from(data.files);
        const evidenceData = [];

        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          console.log("Uploading file:", filePath);
          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);

          evidenceData.push({
            file_url: publicUrl,
            file_type: file.type,
            file_name: file.name,
            description: `Uploaded file: ${file.name}`,
            report_id: finalReportId,
            uploaded_by: user.id,
          });
        }

        if (evidenceData.length > 0) {
          console.log("Saving evidence data:", evidenceData);
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(evidenceData);

          if (evidenceError) {
            console.error("Error saving evidence:", evidenceError);
            throw evidenceError;
          }
        }
      }

      toast({
        title: "Success",
        description: reportId ? "Report updated successfully" : "Report submitted successfully",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error in report submission:", error);
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