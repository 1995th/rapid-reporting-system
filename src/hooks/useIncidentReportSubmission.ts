import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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
          // Type assertion to handle File type
          const uploadFile = file as File;
          const fileExt = uploadFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, uploadFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);

          uploadedFiles.push({
            file_url: publicUrl,
            file_type: uploadFile.type,
            uploaded_by: user.id
          });
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

      let reportResult;
      
      if (id) {
        // Update existing report
        const { data, error } = await supabase
          .from('reports')
          .update(reportData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        reportResult = data;
        
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
      } else {
        // Create new report
        const { data, error } = await supabase
          .from('reports')
          .insert(reportData)
          .select()
          .single();

        if (error) throw error;
        reportResult = data;
        
        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
      }

      // Handle evidence uploads if there are any files
      if (uploadedFiles.length > 0) {
        const evidenceData = uploadedFiles.map(file => ({
          ...file,
          report_id: reportResult.id
        }));

        const { error: evidenceError } = await supabase
          .from('evidence')
          .insert(evidenceData);

        if (evidenceError) throw evidenceError;
      }

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