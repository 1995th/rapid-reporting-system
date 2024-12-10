import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const ProfileInformation = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        email: user.email,
        ...profile,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <p className="mt-1">{profile?.first_name || "Not set"}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <p className="mt-1">{profile?.last_name || "Not set"}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="mt-1">{profile?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <p className="mt-1 capitalize">{profile?.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};