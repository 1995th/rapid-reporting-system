import { supabase } from "@/integrations/supabase/client";
import { uploadFileToStorage } from "@/utils/fileUpload";

interface ReportData {
  title: string;
  description: string;
  incident_date: string | null;
  incident_time: string | null;
  location: string | null;
  user_id: string;
}

// Create or update a report
export const saveReport = async (reportData: ReportData, id?: string) => {
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
  return report;
};

// Delete existing category assignments for a report
export const deleteExistingCategoryAssignments = async (reportId: string) => {
  const { error } = await supabase
    .from("report_category_assignments")
    .delete()
    .eq("report_id", reportId);

  if (error) throw error;
};

// Get main category IDs for selected subcategories
export const getSubcategoriesWithMainCategories = async (subcategoryIds: string[]) => {
  const { data, error } = await supabase
    .from("subcategories")
    .select("id, main_category_id")
    .in("id", subcategoryIds);

  if (error) throw error;
  return data;
};

// Create category assignments for a report
export const createCategoryAssignments = async (
  reportId: string,
  subcategoryIds: string[]
) => {
  if (!subcategoryIds.length) return;

  const subcategories = await getSubcategoriesWithMainCategories(subcategoryIds);
  
  const assignments = subcategoryIds.map(subcategoryId => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return {
      report_id: reportId,
      subcategory_id: subcategoryId,
      main_category_id: subcategory?.main_category_id,
      is_primary: false,
    };
  });

  const { error } = await supabase
    .from("report_category_assignments")
    .insert(assignments);

  if (error) throw error;
};

// Save evidence files for a report
export const saveEvidence = async (
  files: File[],
  reportId: string,
  userId: string
) => {
  if (!files.length) return;

  const uploadedFiles = await Promise.all(
    files.map(file => uploadFileToStorage(file, userId))
  );

  const evidenceData = uploadedFiles.map(file => ({
    ...file,
    report_id: reportId,
    uploaded_by: userId,
  }));

  const { error } = await supabase.from("evidence").insert(evidenceData);
  if (error) throw error;
};