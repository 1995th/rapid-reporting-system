import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface Category {
  id: string;
  name: string;
}

interface SearchFiltersProps {
  filters: {
    title: string;
    categoryId: string | null;
    dateRange: DateRange | undefined;
  };
  categories: Category[];
  onFiltersChange: (filters: {
    title: string;
    categoryId: string | null;
    dateRange: DateRange | undefined;
  }) => void;
}

export function SearchFilters({
  filters,
  categories = [], // Provide default empty array
  onFiltersChange,
}: SearchFiltersProps) {
  return (
    <div 
      className="flex flex-col space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4"
      role="search"
      aria-label="Report filters"
    >
      <Input
        placeholder="Search by title..."
        value={filters.title}
        onChange={(e) =>
          onFiltersChange({ ...filters, title: e.target.value })
        }
        className="w-full"
        aria-label="Search reports by title"
      />
      <Select
        value={filters.categoryId || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            categoryId: value === "all" ? null : value,
          })
        }
      >
        <SelectTrigger className="w-full" aria-label="Filter by category">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Array.isArray(categories) && categories.map((category) => (
            <SelectItem 
              key={category.id} 
              value={category.id}
              role="option"
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="w-full">
        <DatePickerWithRange
          value={filters.dateRange}
          onChange={(range) =>
            onFiltersChange({ ...filters, dateRange: range })
          }
        />
      </div>
    </div>
  );
}