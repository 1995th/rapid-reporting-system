import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFileToStorage } from "@/utils/fileUpload";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null, userId: string) => {
    if (!files?.length) return [];

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadFileToStorage(file, userId)
      );
      const evidenceData = await Promise.all(uploadPromises);
      return evidenceData;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { handleFileUpload, isUploading };
};