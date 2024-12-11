import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ReportFormSchema } from "@/lib/validations/report";

export const useIncidentReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      if (id) {
        const { error } = await supabase
          .from("reports")
          .update({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            main_category_id: data.main_category_id,
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Report updated",
          description: "Your report has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("reports").insert({
          title: data.title,
          description: data.description,
          incident_date: data.incident_date.toISOString(),
          main_category_id: data.main_category_id,
          user_id: user.id,
        });

        if (error) throw error;

        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully.",
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};