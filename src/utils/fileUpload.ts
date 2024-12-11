import { supabase } from "@/integrations/supabase/client";

export interface UploadedFile {
  file_url: string;
  file_type: string;
  uploaded_by: string;
}

export const uploadFileToStorage = async (
  file: File,
  userId: string
): Promise<UploadedFile> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('evidence')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('evidence')
    .getPublicUrl(filePath);

  return {
    file_url: publicUrl,
    file_type: file.type,
    uploaded_by: userId
  };
};