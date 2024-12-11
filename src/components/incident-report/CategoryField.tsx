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
import { useCategoryGroups } from "@/hooks/useCategoryGroups";
import { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  const { data, isLoading } = useCategoryGroups();

  if (isLoading || !data) return null;

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
                  {data.groups.map((group) => (
                    <SelectGroup key={group.id}>
                      <SelectLabel>{group.name}</SelectLabel>
                      {data.categories[group.id]?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
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
              {data.groups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <h4 className="font-medium text-sm">{group.name}</h4>
                  <div className="space-y-1">
                    {data.categories[group.id]?.map((category) => {
                      const isPrimary = form.watch("primary_category_id") === category.id;
                      return (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`secondary-${category.id}`}
                            checked={field.value?.includes(category.id)}
                            disabled={isPrimary}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              const newValue = checked
                                ? [...currentValue, category.id]
                                : currentValue.filter((id: string) => id !== category.id);
                              field.onChange(newValue);
                            }}
                          />
                          <label
                            htmlFor={`secondary-${category.id}`}
                            className={`text-sm leading-none peer-disabled:cursor-not-allowed ${
                              isPrimary ? "text-muted-foreground" : ""
                            }`}
                          >
                            {category.name}
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