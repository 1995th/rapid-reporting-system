import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "./NavItems";
import NavLink from "./NavLink";
import NavActions from "./NavActions";
import MobileNav from "./MobileNav";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">SecureReport</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                isActive={isActive(item.path)}
              />
            ))}
            <NavActions />
          </div>

          {/* Mobile Navigation */}
          <MobileNav
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isActive={isActive}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;