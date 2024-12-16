import { useOrganization } from "@/contexts/OrganizationContext";
import { OrganizationMembers } from "@/components/organization/OrganizationMembers";
import { OrganizationSettings } from "@/components/organization/OrganizationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings } from "lucide-react";

const Organization = () => {
  const { organization, isAdmin } = useOrganization();

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and team members
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <OrganizationMembers />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="settings" className="space-y-4">
            <OrganizationSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Organization;