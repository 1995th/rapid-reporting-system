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
    <Pagination className="w-full flex justify-center" role="navigation" aria-label="Report pagination">
      <PaginationContent className="flex flex-wrap gap-2 justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, currentPage - 1));
            }}
            aria-disabled={currentPage === 1}
            aria-label="Previous page"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPageChange(Math.max(1, currentPage - 1));
              }
            }}
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
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Page ${page}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPageChange(page);
                }
              }}
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
            aria-label="Next page"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPageChange(Math.min(totalPages, currentPage + 1));
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};