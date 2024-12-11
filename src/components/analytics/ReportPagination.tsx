import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ReportPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: ReportPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="w-full flex justify-center">
      <PaginationContent className="flex flex-wrap gap-2 justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, currentPage - 1));
            }}
            aria-disabled={currentPage === 1}
            className="hidden sm:flex"
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page} className="hidden sm:block">
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(totalPages, currentPage + 1));
            }}
            aria-disabled={currentPage === totalPages}
            className="hidden sm:flex"
          />
        </PaginationItem>
        <div className="sm:hidden text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </PaginationContent>
    </Pagination>
  );
};