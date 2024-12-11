import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { reportFormSchema, type ReportFormSchema } from "@/lib/validations/report";
import { useQuery } from "@tanstack/react-query";

export const useIncidentReportForm = () => {
  const { id } = useParams();
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      incident_time: "",
      location: "",
      main_category_id: "",
      categories: [],
      files: undefined,
    },
  });

  const { data: report } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          report_category_assignments (
            subcategory_id
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    onSettled: (data) => {
      if (data) {
        form.reset({
          title: data.title,
          description: data.description,
          incident_date: new Date(data.incident_date),
          incident_time: data.incident_time || "",
          location: data.location || "",
          main_category_id: data.main_category_id || "",
          categories: data.report_category_assignments.map(
            (assignment) => assignment.subcategory_id
          ),
          files: undefined,
        });
      }
    },
  });

  const onSubmit = async (data: ReportFormSchema) => {
    try {
      if (!session?.user?.id) throw new Error("No user found");

      const reportData = {
        title: data.title,
        description: data.description,
        incident_date: data.incident_date.toISOString(),
        incident_time: data.incident_time,
        location: data.location,
        main_category_id: data.main_category_id,
        user_id: session.user.id,
      };

      if (id) {
        const { error: rpcError } = await supabase.rpc("update_report_with_categories", {
          p_report_id: id,
          p_report_data: reportData,
          p_categories: data.categories.map((subcategoryId) => ({
            subcategory_id: subcategoryId,
            main_category_id: data.main_category_id,
            is_primary: false,
          }))
        });

        if (rpcError) throw rpcError;

        toast({
          title: "Success",
          description: "Report updated successfully",
        });
      } else {
        const { data: newReport, error: reportError } = await supabase
          .from("reports")
          .insert(reportData)
          .select()
          .single();

        if (reportError) throw reportError;

        if (data.categories.length > 0) {
          const { error: categoryError } = await supabase
            .from("report_category_assignments")
            .insert(
              data.categories.map((subcategoryId) => ({
                report_id: newReport.id,
                subcategory_id: subcategoryId,
                main_category_id: data.main_category_id,
                is_primary: false,
              }))
            );

          if (categoryError) throw categoryError;
        }

        if (data.files && data.files.length > 0) {
          const uploadPromises = Array.from(data.files).map(async (file) => {
            const fileName = `${newReport.id}/${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("evidence")
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: fileUrl } = supabase.storage
              .from("evidence")
              .getPublicUrl(fileName);

            return {
              report_id: newReport.id,
              file_url: fileUrl.publicUrl,
              file_type: file.type,
              uploaded_by: session.user.id,
            };
          });

          const uploadedFiles = await Promise.all(uploadPromises);

          const { error: evidenceError } = await supabase
            .from("evidence")
            .insert(uploadedFiles);

          if (evidenceError) throw evidenceError;
        }

        toast({
          title: "Success",
          description: "Report created successfully",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditing: !!id,
  };
};