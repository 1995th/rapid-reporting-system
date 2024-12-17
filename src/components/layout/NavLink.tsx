import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  path: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

const NavLink = ({ path, label, icon: Icon, isActive, onClick, className }: NavLinkProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-3" />
      {label}
    </Link>
  );
};

export default NavLink;