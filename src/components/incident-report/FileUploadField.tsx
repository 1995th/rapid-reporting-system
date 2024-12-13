import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "video/mp4",
  "application/pdf",
];

export const fileSchema = z
  .custom<FileList>()
  .optional()
  .refine(
    (files) => {
      if (!files) return true;
      return Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
    },
    "Each file must be less than 10MB"
  )
  .refine(
    (files) => {
      if (!files) return true;
      return Array.from(files).every((file) =>
        ACCEPTED_FILE_TYPES.includes(file.type)
      );
    },
    "Only .jpg, .jpeg, .png, .gif, .mp4 and .pdf files are accepted"
  );

interface FileUploadFieldProps {
  form: UseFormReturn<any>;
}

export const FileUploadField = ({ form }: FileUploadFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="files"
      render={({ field: { onChange, ...field } }) => (
        <FormItem>
          <FormLabel>Evidence Upload</FormLabel>
          <FormControl>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Images, videos, or PDFs (max 10MB each)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_FILE_TYPES.join(",")}
                  onChange={(e) => {
                    onChange(e.target.files);
                  }}
                  {...field}
                  value={undefined} // Fix for the TypeScript error
                />
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
