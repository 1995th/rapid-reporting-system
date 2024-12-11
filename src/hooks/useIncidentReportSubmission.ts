import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import {
  saveReport,
  deleteExistingCategoryAssignments,
  createCategoryAssignments,
  saveEvidence,
} from "@/services/reportSubmissionService";

export const useIncidentReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      // Prepare report data
      const reportData = {
        title: values.title,
        description: values.description,
        incident_date: values.incident_date || null,
        incident_time: values.incident_time || null,
        location: values.location || null,
        user_id: user.id,
      };

      // Save report
      const report = await saveReport(reportData, id);

      // Handle category assignments
      if (id) {
        await deleteExistingCategoryAssignments(id);
      }

      if (values.secondary_categories?.length > 0) {
        await createCategoryAssignments(
          report.id,
          values.secondary_categories
        );
      }

      // Handle file uploads
      if (values.files?.length > 0) {
        await saveEvidence(Array.from(values.files), report.id, user.id);
      }

      toast({
        title: "Success",
        description: id ? "Report updated successfully" : "Report submitted successfully",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};