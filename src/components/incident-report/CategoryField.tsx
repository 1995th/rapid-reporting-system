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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 font-medium hover:bg-muted">
                Select Categories
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                </div>
              </CollapsibleContent>
            </Collapsible>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};