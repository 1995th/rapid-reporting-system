import * as z from "zod";
import { fileSchema } from "@/components/incident-report/FileUploadField";

export const reportFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  incident_date: z.date({
    required_error: "Incident date is required",
  }),
  incident_time: z.string().optional(),
  main_category_id: z.string().min(1, "Main category is required"),
  categories: z.array(z.string()).optional(),
  files: fileSchema,
});

export type ReportFormSchema = z.infer<typeof reportFormSchema>;