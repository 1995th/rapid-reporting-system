import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { navItems } from "./NavItems";
import NavLink from "./NavLink";
import NavActions from "./NavActions";
import MobileNav from "./MobileNav";
import { Siren } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full" />
                  <Siren className="h-6 w-6 text-primary relative z-10" />
                </div>
                <span className="text-xl font-bold">Rapid Reporting System</span>
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
            </div>

            {/* Actions (both mobile and desktop) */}
            <div className="flex items-center">
              <NavActions />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav isActive={isActive} />
      
      {/* Add padding to main content to account for fixed bottom nav */}
      <div className="pb-16 md:pb-0" />
    </>
  );
};

export default Navbar;