import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

interface FileUploadFieldProps {
  form: UseFormReturn<any>;
}

export const FileUploadField = ({ form }: FileUploadFieldProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      form.setValue("files", files);
    }
  };

  const handleDeleteFile = (indexToDelete: number) => {
    const currentFiles = form.getValues("files");
    if (!currentFiles) return;

    const dt = new DataTransfer();
    Array.from(currentFiles as FileList)
      .filter((_, index) => index !== indexToDelete)
      .forEach(file => dt.items.add(file));

    form.setValue("files", dt.files);
  };

  const files = form.watch("files") as FileList | undefined;

  return (
    <FormField
      control={form.control}
      name="files"
      render={() => (
        <FormItem>
          <FormLabel>Attachments (Optional)</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900"
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
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {files && files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <ul className="space-y-2">
                    {Array.from(files).map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span className="truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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