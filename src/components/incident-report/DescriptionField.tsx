import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { SpeechInput } from "./SpeechInput";

interface DescriptionFieldProps {
  form: UseFormReturn<any>;
}

export const DescriptionField = ({ form }: DescriptionFieldProps) => {
  const handleTranscript = (text: string) => {
    const currentDescription = form.getValues("description");
    form.setValue("description", currentDescription ? `${currentDescription}\n${text}` : text);
  };

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center justify-between">
            <span>Description</span>
            <SpeechInput onTranscript={handleTranscript} />
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Provide a detailed description of the incident"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};