import * as z from "zod";

export const reportFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  incident_date: z.date({
    required_error: "Incident date is required",
  }),
  main_category_id: z.string().min(1, "Category is required"),
});

export type ReportFormSchema = z.infer<typeof reportFormSchema>;