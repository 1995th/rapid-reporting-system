import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { SpeechInput } from "./SpeechInput";

interface BasicFieldsProps {
  form: UseFormReturn<any>;
}

export const BasicFields = ({ form }: BasicFieldsProps) => {
  const handleTranscript = (text: string) => {
    const currentDescription = form.getValues("description");
    form.setValue("description", currentDescription ? `${currentDescription}\n${text}` : text);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Brief title of the incident" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Where did this incident occur?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                placeholder="Provide detailed information about the incident"
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};