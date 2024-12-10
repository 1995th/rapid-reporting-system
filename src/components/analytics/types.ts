import { DateRange } from "react-day-picker";

export interface SearchFilters {
  title: string;
  categoryId: string | null;
  dateRange: DateRange | undefined;
}

export interface Report {
  id: string;
  title: string;
  status: string;
  incident_date: string;
  case_categories: {
    name: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}