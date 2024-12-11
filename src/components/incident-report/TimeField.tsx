import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface TimeFieldProps {
  form: UseFormReturn<any>;
}

export const TimeField = ({ form }: TimeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="incident_time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Time</FormLabel>
          <FormControl>
            <Input type="time" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};