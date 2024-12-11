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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
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

  const selectedCount = form.watch("secondary_categories")?.length || 0;

  return (
    <FormField
      control={form.control}
      name="secondary_categories"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categories</FormLabel>
          <FormControl>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <div className="flex items-center justify-between border rounded-lg p-4 mb-2">
                <p className="text-sm">
                  {selectedCount} {selectedCount === 1 ? "category" : "categories"} selected
                </p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
                    <span className="sr-only">Toggle categories</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};