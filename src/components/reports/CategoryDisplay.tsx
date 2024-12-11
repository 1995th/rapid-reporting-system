import { Skeleton } from "@/components/ui/skeleton";

interface CategoryAssignment {
  main_categories?: {
    id: string;
    name: string;
  };
  subcategories?: {
    id: string;
    name: string;
  };
  is_primary: boolean;
}

interface CategoryDisplayProps {
  categoryAssignments: CategoryAssignment[] | null;
  isLoading: boolean;
}

export const CategoryDisplay = ({ categoryAssignments, isLoading }: CategoryDisplayProps) => {
  if (isLoading) {
    return <Skeleton className="h-8 w-32" />;
  }

  if (!categoryAssignments?.length) {
    return <p className="text-sm text-muted-foreground">No categories assigned</p>;
  }

  const primaryCategory = categoryAssignments.find(cat => cat.is_primary);
  const secondaryCategories = categoryAssignments.filter(cat => !cat.is_primary);

  return (
    <div className="space-y-4">
      {primaryCategory && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Primary Category:</p>
          <p className="text-sm">{primaryCategory.main_categories?.name}</p>
          {primaryCategory.subcategories && (
            <>
              <p className="text-sm font-medium text-muted-foreground mt-1">Subcategory:</p>
              <p className="text-sm">{primaryCategory.subcategories.name}</p>
            </>
          )}
        </div>
      )}
      {secondaryCategories?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Offences:</p>
          <ul className="list-disc list-inside space-y-1">
            {secondaryCategories.map((cat, index) => (
              <li key={index} className="text-sm">
                {cat.main_categories?.name}
                {cat.subcategories && ` - ${cat.subcategories.name}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};