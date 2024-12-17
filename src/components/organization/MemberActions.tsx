import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCheck, UserMinus, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  org_role: string;
  status: string;
}

interface MemberActionsProps {
  member: Member;
  onSuccess: () => void;
}

export const MemberActions = ({ member, onSuccess }: MemberActionsProps) => {
  const { toast } = useToast();

  const handleApprove = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", member.id);

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
    onSuccess();
  };

  const handleRemove = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ 
        organization_id: null,
        status: "pending",
        org_role: "member"
      })
      .eq("id", member.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Member removed from organization",
    });
    onSuccess();
  };

  const handleRoleToggle = async () => {
    const newRole = member.org_role === "admin" ? "member" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ org_role: newRole })
      .eq("id", member.id);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${newRole === "admin" ? "promote" : "demote"} member`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Member ${newRole === "admin" ? "promoted to admin" : "demoted to member"}`,
    });
    onSuccess();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {member.status === "pending" && (
          <DropdownMenuItem onClick={handleApprove}>
            <UserCheck className="mr-2 h-4 w-4" />
            Approve Member
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleRoleToggle}>
          <Shield className="mr-2 h-4 w-4" />
          {member.org_role === "admin" ? "Remove Admin" : "Make Admin"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleRemove}
          className="text-destructive focus:text-destructive"
        >
          <UserMinus className="mr-2 h-4 w-4" />
          Remove from Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};