import { useOrganization } from "@/contexts/OrganizationContext";
import { Building2 } from "lucide-react";

export const OrganizationHeader = () => {
  const { organization } = useOrganization();

  if (!organization) return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground mb-4">
      <Building2 className="h-4 w-4" />
      <span>{organization.name}</span>
    </div>
  );
};