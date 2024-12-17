import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NavLink from "./NavLink";
import { navItems } from "./NavItems";
import NavActions from "./NavActions";

interface MobileNavProps {
  isActive: (path: string) => boolean;
}

const MobileNav = ({ isActive }: MobileNavProps) => {
  return (
    <div className="md:hidden flex items-center space-x-2">
      <NavActions />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0">
          <nav className="flex flex-col h-full">
            <div className="flex-1 py-4">
              <div className="px-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    {...item}
                    isActive={isActive(item.path)}
                    className="w-full justify-start text-base py-3"
                  />
                ))}
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;