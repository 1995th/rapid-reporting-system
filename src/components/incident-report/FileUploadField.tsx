import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

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
  const [fileList, setFileList] = useState<string[]>([]);

  return (
    <FormField
      control={form.control}
      name="files"
      render={({ field: { onChange, ...field } }) => (
        <FormItem>
          <FormLabel>Evidence Upload</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                    const files = e.target.files;
                    if (files) {
                      const fileNames = Array.from(files).map(file => file.name);
                      setFileList(fileNames);
                      onChange(files);
                    }
                  }}
                  {...field}
                  value={undefined} // Fix for controlled/uncontrolled input warning
                />
              </label>
              {fileList.length > 0 && (
                <div className="w-full mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected files:</p>
                  <ul className="mt-2 space-y-1">
                    {fileList.map((fileName, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {fileName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};