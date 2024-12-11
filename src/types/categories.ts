export interface CategoryGroup {
  id: string;
  name: string;
  description: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  group_id: string | null;
}

export interface CategoryAssignment {
  category_id: string;
  is_primary: boolean;
}