import { supabase } from "@/integrations/supabase/client";
import { ReportFormSchema } from "@/lib/validations/report";
import { uploadFileToStorage } from "@/utils/fileUpload";
import { saveEvidence } from "./reportService";

export const uploadReportFiles = async (files: FileList, userId: string) => {
  console.log("Processing file uploads...");
  const evidenceData = [];
  const fileArray = Array.from(files);
  
  for (const file of fileArray) {
    try {
      const uploadedFile = await uploadFileToStorage(file, userId);
      evidenceData.push({
        ...uploadedFile,
        report_id: '', // Will be updated with actual report ID
      });
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error(`Failed to upload file: ${file.name}`);
    }
  }
  
  console.log("Files uploaded successfully:", evidenceData);
  return evidenceData;
};

export const updateExistingReport = async (
  id: string,
  data: ReportFormSchema,
  evidenceData: any[]
) => {
  console.log("Updating existing report:", id);
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      title: data.title,
      description: data.description,
      incident_date: data.incident_date.toISOString(),
      incident_time: data.incident_time || null,
      location: data.location || null,
      main_category_id: data.main_category_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating report:", updateError);
    throw updateError;
  }

  if (evidenceData.length > 0) {
    console.log("Adding evidence to existing report:", id);
    await saveEvidence(evidenceData);
  }
};

export const createNewReport = async (
  data: ReportFormSchema,
  userId: string,
  evidenceData: any[]
) => {
  console.log("Creating new report");
  const { data: reportData, error: insertError } = await supabase
    .from("reports")
    .insert({
      title: data.title,
      description: data.description,
      incident_date: data.incident_date.toISOString(),
      incident_time: data.incident_time || null,
      location: data.location || null,
      main_category_id: data.main_category_id || null,
      user_id: userId,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating report:", insertError);
    throw insertError;
  }

  if (evidenceData.length > 0 && reportData) {
    console.log("Adding evidence to new report:", reportData.id);
    const updatedEvidenceData = evidenceData.map(evidence => ({
      ...evidence,
      report_id: reportData.id
    }));
    await saveEvidence(updatedEvidenceData);
  }

  return reportData;
};