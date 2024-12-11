import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { uploadFileToStorage } from "@/utils/fileUpload";

export const useIncidentReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      // Handle file uploads if present
      let uploadedFiles = [];
      if (values.files && values.files.length > 0) {
        for (const file of Array.from(values.files)) {
          const uploadedFile = await uploadFileToStorage(file as File, user.id);
          uploadedFiles.push(uploadedFile);
        }
      }

      // Prepare report data
      const reportData = {
        title: values.title,
        description: values.description,
        incident_date: values.incident_date || null,
        incident_time: values.incident_time || null,
        location: values.location || null,
        user_id: user.id,
        main_category_id: values.primary_category_id,
      };

      // Create or update report
      const { data: report, error: reportError } = id
        ? await supabase
            .from("reports")
            .update(reportData)
            .eq("id", id)
            .select()
            .single()
        : await supabase
            .from("reports")
            .insert(reportData)
            .select()
            .single();

      if (reportError) throw reportError;

      // Handle category assignments
      if (id) {
        // Delete existing assignments
        await supabase
          .from("report_category_assignments")
          .delete()
          .eq("report_id", id);
      }

      // Insert primary category assignment
      await supabase.from("report_category_assignments").insert({
        report_id: report.id,
        main_category_id: values.primary_category_id,
        is_primary: true,
      });

      // Insert secondary category assignments
      if (values.secondary_categories?.length > 0) {
        const secondaryAssignments = values.secondary_categories.map(
          (subcategoryId: string) => ({
            report_id: report.id,
            main_category_id: values.primary_category_id,
            subcategory_id: subcategoryId,
            is_primary: false,
          })
        );
        await supabase
          .from("report_category_assignments")
          .insert(secondaryAssignments);
      }

      // Handle evidence uploads if there are any files
      if (uploadedFiles.length > 0) {
        const evidenceData = uploadedFiles.map((file) => ({
          ...file,
          report_id: report.id,
          uploaded_by: user.id,
        }));
        await supabase.from("evidence").insert(evidenceData);
      }

      toast({
        title: "Success",
        description: id ? "Report updated successfully" : "Report submitted successfully",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};