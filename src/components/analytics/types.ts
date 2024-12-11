import { DateRange } from "react-day-picker";

export interface SearchFilters {
  title: string;
  categoryId: string | null;
  dateRange: DateRange | undefined;
}

export interface CategoryAssignment {
  main_category_id: string;
  main_categories: {
    id: string;
    name: string;
  };
  is_primary: boolean;
}

export interface Report {
  id: string;
  title: string;
  status: string;
  incident_date: string;
  report_category_assignments: CategoryAssignment[];
  profiles: {
    first_name: string;
    last_name: string;
  };
}