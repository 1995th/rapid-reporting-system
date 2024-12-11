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
    <div className="mb-6">
      <h4 className="font-medium text-sm mb-3">{mainCategory.name}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
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