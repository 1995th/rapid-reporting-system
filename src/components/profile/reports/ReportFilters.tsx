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

interface ReportFiltersProps {
  filters: {
    title: string;
    status: string;
    dateRange: DateRange | undefined;
  };
  onFiltersChange: (filters: {
    title: string;
    status: string;
    dateRange: DateRange | undefined;
  }) => void;
}

export const ReportFilters = ({ filters, onFiltersChange }: ReportFiltersProps) => {
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
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value })
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
          onFiltersChange({ ...filters, dateRange: range })
        }
      />
    </div>
  );
};