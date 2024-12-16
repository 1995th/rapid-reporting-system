import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCheck, UserMinus, Shield } from "lucide-react";

interface Member {
  id: string;
  org_role: string;
  status: string;
}

interface MemberActionsProps {
  member: Member;
  onApprove: () => void;
}

export const MemberActions = ({ member, onApprove }: MemberActionsProps) => {
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
          <DropdownMenuItem onClick={onApprove}>
            <UserCheck className="mr-2 h-4 w-4" />
            Approve Member
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Shield className="mr-2 h-4 w-4" />
          {member.org_role === "admin" ? "Remove Admin" : "Make Admin"}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <UserMinus className="mr-2 h-4 w-4" />
          Remove from Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};