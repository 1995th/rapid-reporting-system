import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilters } from "./types";
import { SearchFiltersComponent } from "./SearchFilters";
import { ReportsTable } from "./ReportsTable";
import { ReportPagination } from "./ReportPagination";
import { useReportData } from "@/hooks/useReportData";

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

  // Fetch filtered reports using the custom hook
  const { data: reportData, isLoading } = useReportData(filters, currentPage);

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

          <ReportPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSearch;