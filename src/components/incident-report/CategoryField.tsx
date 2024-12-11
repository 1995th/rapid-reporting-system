import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MainCategoryGroup } from "./MainCategoryGroup";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: mainCategories, error: mainError } = await supabase
        .from("main_categories")
        .select("id, name");
      
      if (mainError) throw mainError;

      const { data: subcategories, error: subError } = await supabase
        .from("subcategories")
        .select("id, name, main_category_id");
      
      if (subError) throw subError;

      const categorizedSubs = subcategories.reduce((acc: any, sub) => {
        if (!acc[sub.main_category_id]) {
          acc[sub.main_category_id] = [];
        }
        acc[sub.main_category_id].push(sub);
        return acc;
      }, {});

      return {
        mainCategories,
        subcategories: categorizedSubs
      };
    }
  });

  if (isLoading) {
    return (
      <FormItem>
        <FormLabel>Categories</FormLabel>
        <div className="border rounded-lg p-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </FormItem>
    );
  }

  if (error || !categories?.mainCategories || !categories?.subcategories) {
    return (
      <FormItem>
        <FormLabel>Categories</FormLabel>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            {error ? "Error loading categories" : "No categories available"}
          </p>
        </div>
      </FormItem>
    );
  }

  const handleSubcategoryChange = (field: any, subcategoryId: string, checked: boolean) => {
    const currentValue = field.value || [];
    const newValue = checked
      ? [...currentValue, subcategoryId]
      : currentValue.filter((id: string) => id !== subcategoryId);
    field.onChange(newValue);
  };

  return (
    <FormField
      control={form.control}
      name="secondary_categories"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categories</FormLabel>
          <FormControl>
            <div className="border rounded-lg p-4">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.mainCategories.map((mainCategory) => (
                    <MainCategoryGroup
                      key={mainCategory.id}
                      mainCategory={mainCategory}
                      subcategories={categories.subcategories[mainCategory.id] || []}
                      selectedCategories={field.value || []}
                      onSubcategoryChange={(subcategoryId, checked) =>
                        handleSubcategoryChange(field, subcategoryId, checked)
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};