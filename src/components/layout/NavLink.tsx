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
        "md:px-4 md:py-2 md:hover:bg-accent/50 md:hover:text-accent-foreground",
        isActive
          ? "md:bg-primary/10 md:text-primary hover:md:bg-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-transparent",
        iconOnly ? "flex-col items-center justify-center p-2" : "gap-2 px-3 py-2",
        className
      )}
      onClick={onClick}
    >
      <Icon className={cn(
        "h-4 w-4",
        iconOnly ? "h-5 w-5" : "",
        isActive ? "text-primary" : ""
      )} />
      {!iconOnly && label}
    </Link>
  );
};

export default NavLink;