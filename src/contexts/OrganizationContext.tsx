import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  isAdmin: boolean;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  isAdmin: false,
  loading: true,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          organization_id,
          org_role,
          organizations (
            id,
            name
          )
        `)
        .eq("id", user.id)
        .single();

      if (profile?.organizations) {
        setOrganization({
          id: profile.organizations.id,
          name: profile.organizations.name,
        });
        setIsAdmin(profile.org_role === "admin");
      }
      setLoading(false);
    };

    fetchOrgDetails();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchOrgDetails();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <OrganizationContext.Provider value={{ organization, isAdmin, loading }}>
      {children}
    </OrganizationContext.Provider>
  );
};