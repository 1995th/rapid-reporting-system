import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberActions } from "./MemberActions";

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  org_role: string;
}

interface ProfileWithAuth {
  id: string;
  first_name: string | null;
  last_name: string | null;
  org_role: string;
  auth_users: {
    email: string;
  } | null;
}

export const OrganizationMembers = () => {
  const { organization, isAdmin } = useOrganization();

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["organization-members", organization?.id],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          org_role,
          auth_users:id (
            email
          )
        `)
        .eq("organization_id", organization?.id);

      if (error) throw error;

      return (profiles as ProfileWithAuth[]).map((profile) => ({
        ...profile,
        email: profile.auth_users?.email || "",
      }));
    },
    enabled: !!organization?.id,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.first_name || member.last_name
                    ? `${member.first_name || ""} ${member.last_name || ""}`
                    : "Not set"}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={member.org_role === "admin" ? "default" : "secondary"}
                  >
                    {member.org_role}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <MemberActions member={member} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};