import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const { data: categories, isLoading } = useQuery({
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

  if (isLoading || !categories) return null;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="primary_category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <ScrollArea className="h-80">
                  {categories.mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="secondary_categories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secondary Categories (Optional)</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4">
              {categories.mainCategories.map((mainCategory) => (
                <div key={mainCategory.id} className="space-y-2">
                  <h4 className="font-medium text-sm">{mainCategory.name}</h4>
                  <div className="space-y-1">
                    {categories.subcategories[mainCategory.id]?.map((sub: any) => {
                      const isPrimary = form.watch("primary_category_id") === mainCategory.id;
                      return (
                        <div key={sub.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`secondary-${sub.id}`}
                            checked={field.value?.includes(sub.id)}
                            disabled={isPrimary}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              const newValue = checked
                                ? [...currentValue, sub.id]
                                : currentValue.filter((id: string) => id !== sub.id);
                              field.onChange(newValue);
                            }}
                          />
                          <label
                            htmlFor={`secondary-${sub.id}`}
                            className={`text-sm leading-none peer-disabled:cursor-not-allowed ${
                              isPrimary ? "text-muted-foreground" : ""
                            }`}
                          >
                            {sub.name}
                            {isPrimary && " (Primary)"}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};