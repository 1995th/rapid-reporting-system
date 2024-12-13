import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
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
import { Loader2 } from "lucide-react";
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

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Fetching report data for ID:", id);
      
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(`
          *,
          report_category_assignments(subcategory_id)
        `)
        .eq("id", id)
        .single();

      if (reportError) {
        console.error("Error fetching report:", reportError);
        toast({
          title: "Error",
          description: "Failed to fetch report data",
          variant: "destructive",
        });
        throw reportError;
      }

      console.log("Fetched report data:", reportData);

      return {
        ...reportData,
        categories: reportData.report_category_assignments?.map(
          (assignment: any) => assignment.subcategory_id
        ) || [],
      };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (report) {
      console.log("Setting form values with report:", report);
      form.reset({
        title: report.title,
        description: report.description,
        incident_date: new Date(report.incident_date),
        incident_time: report.incident_time || "",
        main_category_id: report.main_category_id || "",
        categories: report.categories || [],
      });
    }
  }, [report, form]);

  const onSubmit = async (data: ReportFormSchema) => {
    try {
      console.log("Starting form submission with data:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return;
      }

      // Handle file uploads if present
      let evidenceData = [];
      if (data.files?.length) {
        console.log("Processing file uploads...");
        const files = Array.from(data.files);
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('evidence')
            .upload(fileName, file);

          if (uploadError) {
            console.error("File upload error:", uploadError);
            throw new Error("Failed to upload file");
          }

          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('evidence')
              .getPublicUrl(fileName);

            evidenceData.push({
              file_url: publicUrl,
              file_type: file.type,
              description: file.name,
            });
          }
        }
      }

      if (id) {
        // Update existing report
        console.log("Updating existing report:", id);
        const { error: updateError } = await supabase
          .from("reports")
          .update({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time,
            main_category_id: data.main_category_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating report:", updateError);
          throw updateError;
        }

        // Update category assignments
        if (data.categories?.length) {
          console.log("Updating category assignments...");
          await supabase
            .from("report_category_assignments")
            .delete()
            .eq("report_id", id);

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

          if (categoryError) {
            console.error("Error updating categories:", categoryError);
            throw categoryError;
          }
        }

        // Add new evidence if files were uploaded
        if (evidenceData.length > 0) {
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) {
            console.error("Error adding evidence:", evidenceError);
            throw evidenceError;
          }
        }

        toast({
          title: "Success",
          description: "Report updated successfully",
        });
      } else {
        // Create new report
        console.log("Creating new report");
        const { data: reportData, error: insertError } = await supabase
          .from("reports")
          .insert({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            incident_time: data.incident_time,
            main_category_id: data.main_category_id,
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating report:", insertError);
          throw insertError;
        }

        console.log("New report created:", reportData);

        // Insert category assignments
        if (data.categories?.length) {
          console.log("Adding category assignments...");
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map(subcategoryId => ({
                report_id: reportData.id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) {
            console.error("Error adding categories:", categoryError);
            throw categoryError;
          }
        }

        // Insert evidence if files were uploaded
        if (evidenceData.length > 0) {
          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(
              evidenceData.map(evidence => ({
                ...evidence,
                report_id: reportData.id,
                uploaded_by: user.id,
              }))
            );

          if (evidenceError) {
            console.error("Error adding evidence:", evidenceError);
            throw evidenceError;
          }
        }

        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
            <Button type="submit">
              {id ? "Update Report" : "Submit Report"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportForm;