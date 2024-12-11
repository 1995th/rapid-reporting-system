import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainCategoryGroup } from "./MainCategoryGroup";
import { UseFormReturn } from "react-hook-form";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const { data: categoryData } = useQuery({
    queryKey: ["categories-with-subcategories"],
    queryFn: async () => {
      const { data: mainCategories, error: mainError } = await supabase
        .from("main_categories")
        .select("*")
        .order("name");

      if (mainError) throw mainError;

      const { data: subcategories, error: subError } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");

      if (subError) throw subError;

      return {
        mainCategories,
        subcategories: subcategories.reduce((acc, category) => {
          if (!acc[category.main_category_id]) {
            acc[category.main_category_id] = [];
          }
          acc[category.main_category_id].push(category);
          return acc;
        }, {} as Record<string, any[]>),
      };
    },
  });

  const selectedCategories = form.watch("categories") || [];

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    const currentCategories = form.getValues("categories") || [];
    const newCategories = checked
      ? [...currentCategories, subcategoryId]
      : currentCategories.filter((id: string) => id !== subcategoryId);
    form.setValue("categories", newCategories);
  };

  if (!categoryData) return null;

  return (
    <FormField
      control={form.control}
      name="categories"
      render={() => (
        <FormItem>
          <FormLabel>Categories</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {categoryData.mainCategories.map((mainCategory) => (
                <MainCategoryGroup
                  key={mainCategory.id}
                  mainCategory={mainCategory}
                  subcategories={categoryData.subcategories[mainCategory.id] || []}
                  selectedCategories={selectedCategories}
                  onSubcategoryChange={handleSubcategoryChange}
                />
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};