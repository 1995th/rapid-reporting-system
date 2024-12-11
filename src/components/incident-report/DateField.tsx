import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { UseFormReturn } from "react-hook-form";

interface DateFieldProps {
  form: UseFormReturn<any>;
}

export const DateField = ({ form }: DateFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="incident_date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Incident Date</FormLabel>
          <FormControl>
            <DatePicker
              date={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};