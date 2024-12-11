import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CaseReferenceFieldProps {
  form: UseFormReturn<any>;
}

export const CaseReferenceField = ({ form }: CaseReferenceFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="case_reference"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Case Reference (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="Enter case reference number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};