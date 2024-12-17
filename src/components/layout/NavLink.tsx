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
  iconOnly?: boolean;
}

const NavLink = ({ 
  path, 
  label, 
  icon: Icon, 
  isActive, 
  onClick, 
  className,
  iconOnly 
}: NavLinkProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "inline-flex items-center rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        !iconOnly && "md:px-6 md:py-2.5", // Added more padding for desktop
        className
      )}
      onClick={onClick}
    >
      <Icon className={cn(
        "h-4 w-4",
        iconOnly ? "h-5 w-5" : "mr-2"
      )} />
      {!iconOnly && label}
    </Link>
  );
};

export default NavLink;