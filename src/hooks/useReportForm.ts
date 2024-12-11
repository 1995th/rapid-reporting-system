import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReportFormSchema, reportFormSchema } from "@/lib/validations/report";
import { useEffect } from "react";

export const useReportForm = (reportData: any) => {
  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      incident_time: "",
      main_category_id: "",
      categories: [],
      case_reference: "",
      files: undefined,
    },
  });

  useEffect(() => {
    if (reportData) {
      console.log("Setting form values with report data:", reportData);
      form.reset({
        title: reportData.title,
        description: reportData.description,
        incident_date: new Date(reportData.incident_date),
        incident_time: reportData.incident_time,
        main_category_id: reportData.main_category_id,
        categories: reportData.categories,
        case_reference: reportData.case_reference,
      });
    }
  }, [reportData, form]);

  return form;
};