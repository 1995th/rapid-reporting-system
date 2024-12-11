import { SubcategoryCheckbox } from "./SubcategoryCheckbox";

interface Subcategory {
  id: string;
  name: string;
}

interface MainCategoryGroupProps {
  mainCategory: {
    id: string;
    name: string;
  };
  subcategories: Subcategory[];
  selectedCategories: string[];
  onSubcategoryChange: (subcategoryId: string, checked: boolean) => void;
}

export const MainCategoryGroup = ({
  mainCategory,
  subcategories,
  selectedCategories,
  onSubcategoryChange,
}: MainCategoryGroupProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{mainCategory.name}</h4>
      <div className="space-y-1">
        {subcategories.map((sub) => (
          <SubcategoryCheckbox
            key={sub.id}
            id={sub.id}
            name={sub.name}
            checked={selectedCategories.includes(sub.id)}
            onCheckedChange={(checked) => onSubcategoryChange(sub.id, checked)}
          />
        ))}
      </div>
    </div>
  );
};