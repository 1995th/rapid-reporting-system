import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Fetch main categories
      const { data: mainCategories, error: mainError } = await supabase
        .from("main_categories")
        .select("id, name");
      
      if (mainError) throw mainError;

      // Fetch subcategories
      const { data: subcategories, error: subError } = await supabase
        .from("subcategories")
        .select("id, name, main_category_id");
      
      if (subError) throw subError;

      // Organize subcategories by main category
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
                    <div key={mainCategory.id} className="space-y-2">
                      <h4 className="font-medium text-sm">{mainCategory.name}</h4>
                      <div className="space-y-1">
                        {categories.subcategories[mainCategory.id]?.map((sub: any) => (
                          <div key={sub.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${sub.id}`}
                              checked={field.value?.includes(sub.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const newValue = checked
                                  ? [...currentValue, sub.id]
                                  : currentValue.filter((id: string) => id !== sub.id);
                                field.onChange(newValue);
                              }}
                            />
                            <label
                              htmlFor={`category-${sub.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed"
                            >
                              {sub.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
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