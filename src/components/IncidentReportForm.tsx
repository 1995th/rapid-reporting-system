import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BackButton } from "@/components/layout/BackButton";
import { TitleField } from "./incident-report/TitleField";
import { DescriptionField } from "./incident-report/DescriptionField";
import { DateField } from "./incident-report/DateField";
import { TimeField } from "./incident-report/TimeField";
import { CategoryField } from "./incident-report/CategoryField";
import { FileUploadField } from "./incident-report/FileUploadField";
import { ReportFormSchema, reportFormSchema } from "@/lib/validations/report";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const IncidentReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      incident_time: "",
      main_category_id: "",
      categories: [],
      files: undefined,
    },
  });

  const { data: report } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*, report_category_assignments(subcategory_id)")
        .eq("id", id)
        .single();

      if (reportError) throw reportError;

      return {
        ...reportData,
        categories: reportData.report_category_assignments.map(
          (assignment: any) => assignment.subcategory_id
        ),
      };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (report) {
      form.reset({
        title: report.title,
        description: report.description,
        incident_date: new Date(report.incident_date),
        incident_time: report.incident_time,
        main_category_id: report.main_category_id,
        categories: report.categories,
      });
    }
  }, [report, form]);

  const onSubmit = async (data: ReportFormSchema) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return;
      }

      const reportData = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString().split('T')[0],
        incident_time: data.incident_time,
        main_category_id: data.main_category_id,
        user_id: user.id,
      };

      if (id) {
        const { error: updateError } = await supabase
          .from("reports")
          .update(reportData)
          .eq("id", id);

        if (updateError) throw updateError;

        // Delete existing category assignments
        await supabase
          .from("report_category_assignments")
          .delete()
          .eq("report_id", id);

        // Insert new category assignments
        if (data.categories?.length) {
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map(subcategoryId => ({
                report_id: id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) throw categoryError;
        }
      } else {
        const { data: newReport, error: insertError } = await supabase
          .from("reports")
          .insert(reportData)
          .select()
          .single();

        if (insertError) throw insertError;

        if (data.categories?.length) {
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map(subcategoryId => ({
                report_id: newReport.id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) throw categoryError;
        }
      }

      toast({
        title: "Success",
        description: id ? "Report updated successfully" : "Report submitted successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while submitting the report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? "Edit Report" : "Submit New Report"}
          </h1>
          <p className="text-muted-foreground">
            {id
              ? "Update the details of your incident report"
              : "Fill out the details of your incident report"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TitleField form={form} />
            <DescriptionField form={form} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateField form={form} />
              <TimeField form={form} />
            </div>
            <CategoryField form={form} />
            <FileUploadField form={form} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : (id ? "Update Report" : "Submit Report")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportForm;