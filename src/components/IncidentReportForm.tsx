import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BasicFields } from "./incident-report/BasicFields";
import { CategoryField } from "./incident-report/CategoryField";
import { DateField } from "./incident-report/DateField";
import { TimeField } from "./incident-report/TimeField";
import { DescriptionField } from "./incident-report/DescriptionField";
import { FileUploadField } from "./incident-report/FileUploadField";
import { useIncidentReportForm } from "@/hooks/useIncidentReportForm";

const IncidentReportForm = () => {
  const { form, onSubmit, isEditing } = useIncidentReportForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicFields form={form} />
        <CategoryField form={form} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField form={form} />
          <TimeField form={form} />
        </div>
        <DescriptionField form={form} />
        <FileUploadField form={form} />
        <Button type="submit" className="w-full">
          {isEditing ? "Update Report" : "Submit Report"}
        </Button>
      </form>
    </Form>
  );
};

export default IncidentReportForm;