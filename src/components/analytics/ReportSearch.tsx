import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchFilters } from "./types";
import { SearchFilters as SearchFiltersComponent } from "./SearchFilters";
import { ReportsTable } from "./ReportsTable";

const ITEMS_PER_PAGE = 10;

const ReportSearch = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    title: "",
    categoryId: null,
    dateRange: undefined,
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
          <SearchFiltersComponent
            filters={filters}
            categories={categories || []}
            onFiltersChange={setFilters}
          />

          <ReportsTable reports={reportData?.data || []} />

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={currentPage === totalPages}
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