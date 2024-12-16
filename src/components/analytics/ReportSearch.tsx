import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilters } from "./SearchFilters";
import { ReportsTable } from "./ReportsTable";
import { ReportPagination } from "./ReportPagination";
import { useReportData } from "@/hooks/useReportData";
import { useOrganization } from "@/contexts/OrganizationContext";

const ITEMS_PER_PAGE = 10;

const ReportSearch = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    title: "",
    categoryId: null,
    dateRange: undefined,
  });
  const { isAdmin } = useOrganization();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_categories")
        .select("id, name")
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: reportData, isLoading: isReportsLoading } = useReportData(filters, currentPage);

  const totalPages = reportData?.count
    ? Math.ceil(reportData.count / ITEMS_PER_PAGE)
    : 0;

  if (isReportsLoading || isCategoriesLoading) {
    return <Skeleton className="w-full h-[400px]" role="progressbar" aria-label="Loading reports" />;
  }

  return (
    <Card role="region" aria-label="Report search section">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Search Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 md:space-y-6">
          <SearchFilters
            filters={filters}
            categories={categories}
            onFiltersChange={setFilters}
          />

          <ReportsTable 
            reports={reportData?.data || []} 
            showActions={isAdmin}
          />

          <div className="flex justify-center mt-4">
            <ReportPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSearch;