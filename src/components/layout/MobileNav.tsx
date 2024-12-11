import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavLink from "./NavLink";
import { navItems } from "./NavItems";
import NavActions from "./NavActions";

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isActive: (path: string) => boolean;
}

const MobileNav = ({ isOpen, setIsOpen, isActive }: MobileNavProps) => {
  return (
    <>
      <div className="md:hidden flex items-center space-x-2">
        <NavActions />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                isActive={isActive(item.path)}
                onClick={() => setIsOpen(false)}
                className="block w-full"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;