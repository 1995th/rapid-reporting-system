import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReportFormSchema } from "@/lib/validations/report";
import { uploadFileToStorage } from "@/utils/fileUpload";

export const useIncidentReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);
      console.log("Starting form submission with data:", data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Handle file uploads if files are present
      let evidenceData = [];
      if (data.files?.length) {
        console.log("Uploading files...");
        const files = Array.from(data.files);
        const uploadPromises = files.map(file => 
          uploadFileToStorage(file, user.id)
        );
        evidenceData = await Promise.all(uploadPromises);
        console.log("Files uploaded:", evidenceData);
      }

      if (id) {
        console.log("Updating existing report:", id);
        // Update existing report
        const { error: updateError } = await supabase
          .from("reports")
          .update({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time,
            main_category_id: data.main_category_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating report:", updateError);
          throw updateError;
        }

        // Update category assignments
        if (data.categories?.length) {
          console.log("Updating category assignments...");
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

          if (categoryError) {
            console.error("Error updating categories:", categoryError);
            throw categoryError;
          }
        }

        // Insert new evidence if files were uploaded
        if (evidenceData.length > 0) {
          console.log("Adding new evidence...");
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) {
            console.error("Error adding evidence:", evidenceError);
            throw evidenceError;
          }
        }
      } else {
        console.log("Creating new report");
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

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }

        console.log("New report created:", reportData);

        // Insert category assignments
        if (data.categories?.length) {
          console.log("Adding category assignments...");
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

          if (categoryError) {
            console.error("Error adding categories:", categoryError);
            throw categoryError;
          }
        }

        // Insert evidence if files were uploaded
        if (evidenceData.length > 0) {
          console.log("Adding evidence...");
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: reportData.id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) {
            console.error("Error adding evidence:", evidenceError);
            throw evidenceError;
          }
        }
      }

      console.log("Form submission completed successfully");
    } catch (error) {
      console.error("Error in form submission:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};