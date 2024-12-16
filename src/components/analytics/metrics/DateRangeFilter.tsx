import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  return (
    <DatePickerWithRange
      value={value}
      onChange={onChange}
    />
  );
};