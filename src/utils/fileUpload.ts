import { supabase } from "@/integrations/supabase/client";

export interface UploadedFile {
  file_url: string;
  file_type: string;
  description: string;
}

export const uploadFileToStorage = async (
  file: File,
  userId: string
): Promise<UploadedFile> => {
  console.log("Starting file upload for:", file.name);
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  console.log("Uploading file to path:", filePath);
  const { error: uploadError } = await supabase.storage
    .from('evidence')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('evidence')
    .getPublicUrl(filePath);

  console.log("File uploaded successfully, public URL:", publicUrl);

  return {
    file_url: publicUrl,
    file_type: file.type,
    description: file.name
  };
};