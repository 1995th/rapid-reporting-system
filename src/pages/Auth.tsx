import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { OrganizationSelect } from "@/components/auth/OrganizationSelect";
import { Siren } from "lucide-react";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isSignIn, setIsSignIn] = useState(searchParams.get("mode") !== "signup");
  const [showOrgSelect, setShowOrgSelect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", session.user.id)
          .single();

        if (profile?.organization_id) {
          navigate("/dashboard");
        } else {
          setShowOrgSelect(true);
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", session.user.id)
          .single();

        if (profile?.organization_id) {
          navigate("/dashboard");
        } else {
          setShowOrgSelect(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const toggleForm = () => setIsSignIn(!isSignIn);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full" />
              <Siren className="h-8 w-8 text-primary relative z-10" />
            </div>
            <h1 className="text-2xl font-bold">Rapid Reporting System</h1>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {showOrgSelect ? (
            <OrganizationSelect />
          ) : (
            isSignIn ? (
              <SignInForm onToggle={toggleForm} />
            ) : (
              <SignUpForm onToggle={toggleForm} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;