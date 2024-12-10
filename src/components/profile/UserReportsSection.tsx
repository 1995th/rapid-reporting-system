import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export const UserReportsSection = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    title: "",
    status: "all",
    dateRange: undefined as { from: Date; to: Date } | undefined,
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ["user-reports", userId, filters],
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select(
          `
          *,
          case_categories (
            name
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (filters.title) {
        query = query.ilike("title", `%${filters.title}%`);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.dateRange?.from) {
        query = query.gte(
          "incident_date",
          format(filters.dateRange.from, "yyyy-MM-dd")
        );
      }

      if (filters.dateRange?.to) {
        query = query.lte(
          "incident_date",
          format(filters.dateRange.to, "yyyy-MM-dd")
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by title..."
              value={filters.title}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value })
              }
            />
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange
              value={filters.dateRange}
              onChange={(range) =>
                setFilters({ ...filters, dateRange: range })
              }
            />
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reports?.map((report) => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Category: {report.case_categories?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {report.incident_date
                        ? format(new Date(report.incident_date), "PPP")
                        : "No date specified"}
                    </p>
                  </div>
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
              </div>
            ))}
            {reports?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No reports found
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};