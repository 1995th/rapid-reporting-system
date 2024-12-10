import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 10;

interface SearchFilters {
  title: string;
  categoryId: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

const ReportSearch = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    title: "",
    categoryId: null,
    dateRange: {
      from: null,
      to: null,
    },
  });

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_categories")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch filtered reports
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", filters, currentPage],
    queryFn: async () => {
      let query = supabase
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
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.title) {
        query = query.ilike("title", `%${filters.title}%`);
      }

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.dateRange.from) {
        query = query.gte("incident_date", format(filters.dateRange.from, "yyyy-MM-dd"));
      }

      if (filters.dateRange.to) {
        query = query.lte("incident_date", format(filters.dateRange.to, "yyyy-MM-dd"));
      }

      // Apply pagination
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(start, start + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return { data, count };
    },
  });

  const totalPages = reportData?.count
    ? Math.ceil(reportData.count / ITEMS_PER_PAGE)
    : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by title..."
              value={filters.title}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Select
              value={filters.categoryId || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, categoryId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePickerWithRange
              value={filters.dateRange}
              onChange={(range) =>
                setFilters((prev) => ({ ...prev, dateRange: range }))
              }
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData?.data?.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.case_categories?.name}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {report.profiles?.first_name} {report.profiles?.last_name}
                    </TableCell>
                    <TableCell>
                      {report.incident_date
                        ? format(new Date(report.incident_date), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSearch;