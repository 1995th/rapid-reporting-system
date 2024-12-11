import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { uploadFileToStorage } from "@/utils/fileUpload";
import { createReport, updateReport, saveEvidence } from "@/services/reportService";

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

      // Handle file uploads if present
      let uploadedFiles = [];
      if (values.files && values.files.length > 0) {
        for (const file of Array.from(values.files)) {
          const uploadedFile = await uploadFileToStorage(file as File, user.id);
          uploadedFiles.push(uploadedFile);
        }
      }

      // Prepare report data
      const reportData = {
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        incident_date: values.incident_date || null,
        incident_time: values.incident_time || null,
        location: values.location || null,
        user_id: user.id,
      };

      // Create or update report
      const reportResult = id 
        ? await updateReport(id, reportData)
        : await createReport(reportData);

      // Handle evidence uploads if there are any files
      if (uploadedFiles.length > 0) {
        const evidenceData = uploadedFiles.map(file => ({
          ...file,
          report_id: reportResult.id
        }));
        await saveEvidence(evidenceData);
      }

      toast({
        title: "Success",
        description: id ? "Report updated successfully" : "Report submitted successfully",
      });

      navigate('/');
    } catch (error: any) {
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