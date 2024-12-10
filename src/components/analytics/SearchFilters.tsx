import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchFilters as SearchFiltersType } from "./types";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  categories: Array<{ id: string; name: string }>;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

export function SearchFiltersComponent({
  filters,
  categories,
  onFiltersChange,
}: SearchFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        placeholder="Search by title..."
        value={filters.title}
        onChange={(e) =>
          onFiltersChange({ ...filters, title: e.target.value })
        }
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
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
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
          onFiltersChange({ ...filters, dateRange: range })
        }
      />
    </div>
  );
}