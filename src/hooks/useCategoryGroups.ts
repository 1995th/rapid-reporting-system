import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryGroup } from "@/types/categories";

export const useCategoryGroups = () => {
  return useQuery({
    queryKey: ["category-groups"],
    queryFn: async () => {
      const { data: groups, error: groupsError } = await supabase
        .from("main_categories")
        .select("*")
        .order("name");

      if (groupsError) throw groupsError;

      const { data: categories, error: categoriesError } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      return {
        groups: groups as CategoryGroup[],
        categories: categories.reduce((acc, category) => {
          if (category.main_category_id) {
            if (!acc[category.main_category_id]) {
              acc[category.main_category_id] = [];
            }
            acc[category.main_category_id].push(category);
          }
          return acc;
        }, {} as Record<string, any[]>)
      };
    },
  });
};