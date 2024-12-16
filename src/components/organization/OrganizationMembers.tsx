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
import { useToast } from "@/components/ui/use-toast";

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  org_role: string;
  status: string;
}

export const OrganizationMembers = () => {
  const { organization, isAdmin } = useOrganization();
  const { toast } = useToast();

  const { data: members, isLoading, refetch } = useQuery<Member[]>({
    queryKey: ["organization-members", organization?.id],
    queryFn: async () => {
      if (!organization?.id) throw new Error("No organization ID");
      
      const { data, error } = await supabase.functions.invoke('get-organization-members', {
        body: { organizationId: organization.id }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  const handleApprove = async (memberId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve member",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Member approved successfully",
    });
    refetch();
  };

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
              <TableHead>Status</TableHead>
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
                <TableCell>
                  <Badge
                    variant={member.status === "approved" ? "success" : "warning"}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <MemberActions 
                      member={member} 
                      onApprove={() => handleApprove(member.id)}
                    />
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