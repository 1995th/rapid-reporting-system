import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface LocationFieldProps {
  form: UseFormReturn<any>;
}

export const LocationField = ({ form }: LocationFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Input placeholder="Where did this incident occur?" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};