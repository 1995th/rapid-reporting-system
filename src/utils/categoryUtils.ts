import { supabase } from "@/integrations/supabase/client";

export async function getMainCategoryForSubcategories(subcategoryIds: string[]) {
  if (!subcategoryIds.length) return [];
  
  const { data, error } = await supabase
    .from("subcategories")
    .select("id, main_category_id")
    .in("id", subcategoryIds);

  if (error) throw error;
  return data;
}

export async function updateCategoryAssignments(reportId: string, categories: string[]) {
  if (!categories?.length) return;

  // First get the main category IDs for all subcategories
  const subcategoriesData = await getMainCategoryForSubcategories(categories);
  
  // Delete existing assignments
  const { error: deleteError } = await supabase
    .from("report_category_assignments")
    .delete()
    .eq("report_id", reportId);

  if (deleteError) throw deleteError;

  // Create new assignments with correct main_category_ids
  const assignments = subcategoriesData.map(sub => ({
    report_id: reportId,
    subcategory_id: sub.id,
    main_category_id: sub.main_category_id,
    is_primary: false,
  }));

  const { error: insertError } = await supabase
    .from("report_category_assignments")
    .insert(assignments);

  if (insertError) throw insertError;
}