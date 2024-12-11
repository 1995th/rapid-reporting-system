import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BackButton } from "@/components/layout/BackButton";
import { CategorySelect } from "./reports/CategorySelect";
import { DatePicker } from "./ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { ReportFormSchema, reportFormSchema } from "@/lib/validations/report";

const IncidentReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incident_date: new Date(),
      main_category_id: "",
    },
  });

  const { data: report } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (report) {
      form.reset({
        title: report.title,
        description: report.description,
        incident_date: new Date(report.incident_date),
        main_category_id: report.main_category_id,
      });
    }
  }, [report, form]);

  const onSubmit = async (data: ReportFormSchema) => {
    try {
      setIsSubmitting(true);

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      if (id) {
        const { error } = await supabase
          .from("reports")
          .update({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date.toISOString(),
            main_category_id: data.main_category_id,
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Report updated",
          description: "Your report has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("reports").insert({
          title: data.title,
          description: data.description,
          incident_date: data.incident_date.toISOString(),
          main_category_id: data.main_category_id,
          user_id: user.id,
        });

        if (error) throw error;

        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully.",
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? "Edit Report" : "Submit New Report"}
          </h1>
          <p className="text-muted-foreground">
            {id
              ? "Update the details of your incident report"
              : "Fill out the details of your incident report"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter report title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the incident"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incident_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="main_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategorySelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : id ? "Update Report" : "Submit Report"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportForm;