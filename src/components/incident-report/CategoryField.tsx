import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CategorySelect } from "@/components/reports/CategorySelect";
import { UseFormReturn } from "react-hook-form";

interface CategoryFieldProps {
  form: UseFormReturn<any>;
}

export const CategoryField = ({ form }: CategoryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="main_category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <CategorySelect
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};