import { useState } from "react";
import { ReportFormSchema } from "@/lib/validations/report";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  uploadReportFiles, 
  updateExistingReport, 
  createNewReport 
} from "@/services/reportOperations";

export const useReportSubmission = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);
      console.log("Starting form submission with data:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a report",
          variant: "destructive",
        });
        return false;
      }

      // Handle file uploads if present
      let evidenceData = [];
      if (data.files?.length) {
        try {
          evidenceData = await uploadReportFiles(data.files, user.id);
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to upload files",
            variant: "destructive",
          });
          return false;
        }
      }

      if (id) {
        await updateExistingReport(id, data, evidenceData);
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
      } else {
        await createNewReport(data, user.id, evidenceData);
        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
      }

      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};