import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  org_role: string;
}

interface MemberActionsProps {
  member: Member;
}

export const MemberActions = ({ member }: MemberActionsProps) => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleRoleChange = async () => {
    const newRole = member.org_role === "admin" ? "member" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ org_role: newRole })
      .eq("id", member.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({
      queryKey: ["organization-members", organization?.id],
    });

    toast({
      title: "Success",
      description: `Member role updated to ${newRole}`,
    });
  };

  const handleRemoveMember = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ organization_id: null, org_role: "member" })
      .eq("id", member.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({
      queryKey: ["organization-members", organization?.id],
    });

    toast({
      title: "Success",
      description: "Member removed from organization",
    });
    setShowRemoveDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRoleChange}>
            <Shield className="mr-2 h-4 w-4" />
            Make {member.org_role === "admin" ? "Member" : "Admin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="text-destructive"
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Remove from Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the organization?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};