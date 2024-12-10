import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "video/mp4",
  "application/pdf",
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().uuid("Please select a category"),
  location: z.string().optional(),
  files: z
    .custom<FileList>()
    .optional()
    .refine((files) => {
      if (!files) return true;
      return Array.from(files).every(
        (file) => file.size <= MAX_FILE_SIZE
      );
    }, "Each file must be less than 10MB")
    .refine((files) => {
      if (!files) return true;
      return Array.from(files).every((file) =>
        ACCEPTED_FILE_TYPES.includes(file.type)
      );
    }, "Only .jpg, .jpeg, .png, .gif, .mp4 and .pdf files are accepted"),
});

const IncidentReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_categories")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // First, create the report
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .insert({
          title: values.title,
          description: values.description,
          category_id: values.category_id,
          location: values.location || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Then, upload files if any
      if (values.files && values.files.length > 0) {
        const files = Array.from(values.files);
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("evidence")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrl } = supabase.storage
            .from("evidence")
            .getPublicUrl(filePath);

          // Create evidence record
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert({
              report_id: report.id,
              file_url: publicUrl.publicUrl,
              file_type: file.type,
              uploaded_by: user.id,
            });

          if (evidenceError) throw evidenceError;
        });

        await Promise.all(uploadPromises);
      }

      toast({
        title: "Success",
        description: "Your report has been submitted successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Submit Incident Report</h1>
        <p className="text-muted-foreground mt-2">
          Please provide details about the incident you'd like to report.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <FormLabel>Description</FormLabel>
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

          <FormField
            control={form.control}
            name="files"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Attachments (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or
                          drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Images, videos, or PDFs (max 10MB each)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept={ACCEPTED_FILE_TYPES.join(",")}
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                        {...field}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default IncidentReportForm;