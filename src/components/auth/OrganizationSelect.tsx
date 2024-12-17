import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export const OrganizationSelect = () => {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data: orgs, error } = await supabase
      .from("organizations")
      .select("id, name");
    
    if (error) {
      toast({
        title: "Error fetching organizations",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setOrganizations(orgs || []);
  };

  const handleJoinOrg = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ 
        organization_id: selectedOrg,
        status: 'pending'
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error joining organization",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Request sent to join organization. Please wait for admin approval.",
    });
    navigate("/dashboard");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Your Organization</CardTitle>
        <CardDescription>
          Select your organization to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedOrg}
          onValueChange={setSelectedOrg}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleJoinOrg}
          disabled={!selectedOrg}
          className="w-full"
        >
          Request to Join
        </Button>
      </CardContent>
    </Card>
  );
};