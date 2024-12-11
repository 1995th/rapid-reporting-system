import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          case_categories (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Report deleted",
        description: "The report has been successfully deleted.",
      });
      navigate("/analytics");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Report Details</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/edit-report/${id}`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Report
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Report
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  report and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteReportMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{report.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
              <p>{report.case_categories?.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
              <Badge
                variant={
                  report.status === "resolved"
                    ? "success"
                    : report.status === "in_progress"
                    ? "warning"
                    : "default"
                }
              >
                {report.status}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Reporter</h3>
              <p>
                {report.profiles?.first_name} {report.profiles?.last_name}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Date</h3>
              <p>
                {report.incident_date
                  ? format(new Date(report.incident_date), "MMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{report.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetail;