import NavLink from "./NavLink";
import { navItems } from "./NavItems";

interface MobileNavProps {
  isActive: (path: string) => boolean;
}

const MobileNav = ({ isActive }: MobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            {...item}
            isActive={isActive(item.path)}
            className="flex flex-col items-center justify-center p-2"
            iconOnly
          />
        ))}
      </div>
    </div>
  );
};

export default MobileNav;