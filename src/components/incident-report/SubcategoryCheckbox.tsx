import { Checkbox } from "@/components/ui/checkbox";

interface SubcategoryCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const SubcategoryCheckbox = ({
  id,
  name,
  checked,
  onCheckedChange,
}: SubcategoryCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`category-${id}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <label
        htmlFor={`category-${id}`}
        className="text-sm leading-none peer-disabled:cursor-not-allowed"
      >
        {name}
      </label>
    </div>
  );
};