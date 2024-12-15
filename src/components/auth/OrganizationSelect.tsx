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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const OrganizationSelect = () => {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
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
      .update({ organization_id: selectedOrg })
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
      description: "Successfully joined organization",
    });
    navigate("/dashboard");
  };

  const handleCreateOrg = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insert new organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: newOrgName })
      .select()
      .single();

    if (orgError) {
      toast({
        title: "Error creating organization",
        description: orgError.message,
        variant: "destructive",
      });
      return;
    }

    // Update user profile with new org and admin role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        organization_id: org.id,
        org_role: 'admin'
      })
      .eq("id", user.id);

    if (profileError) {
      toast({
        title: "Error updating profile",
        description: profileError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Organization created successfully",
    });
    navigate("/dashboard");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join or Create Organization</CardTitle>
        <CardDescription>
          Select an existing organization or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating ? (
          <div className="space-y-4">
            <Input
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrg}
                disabled={!newOrgName}
              >
                Create Organization
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(true)}
              >
                Create New
              </Button>
              <Button
                onClick={handleJoinOrg}
                disabled={!selectedOrg}
              >
                Join Organization
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};