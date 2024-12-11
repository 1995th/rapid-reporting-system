import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryGroup } from "@/types/categories";

export const useCategoryGroups = () => {
  return useQuery({
    queryKey: ["category-groups"],
    queryFn: async () => {
      const { data: groups, error: groupsError } = await supabase
        .from("report_category_groups")
        .select("*")
        .order("name");

      if (groupsError) throw groupsError;

      const { data: categories, error: categoriesError } = await supabase
        .from("case_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      return {
        groups: groups as CategoryGroup[],
        categories: categories.reduce((acc, category) => {
          if (category.group_id) {
            if (!acc[category.group_id]) {
              acc[category.group_id] = [];
            }
            acc[category.group_id].push(category);
          }
          return acc;
        }, {} as Record<string, any[]>)
      };
    },
  });
};